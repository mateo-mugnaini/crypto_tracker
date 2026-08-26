from app.database.connection import get_connection


class PortfolioRepository:
    def save_or_update(self, holding):
        connection = get_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO portfolio_holdings
        (
            user_id,
            coin_id,
            quantity,
            average_buy_price,
            created_at,
            updated_at
        )
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            quantity = VALUES(quantity),
            average_buy_price = VALUES(average_buy_price),
            updated_at = CURRENT_TIMESTAMP
        """

        cursor.execute(
            query,
            (
                holding.user_id,
                holding.coin_id,
                holding.quantity,
                holding.average_buy_price,
            ),
        )
        connection.commit()
        cursor.close()
        connection.close()

    def delete(self, user_id: int, coin_id: str) -> bool:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
        DELETE FROM portfolio_holdings
        WHERE user_id = %s
        AND coin_id = %s
        """

        cursor.execute(query, (user_id, coin_id))
        deleted = cursor.rowcount > 0
        connection.commit()
        cursor.close()
        connection.close()
        return deleted

    def exists(self, user_id: int, coin_id: str) -> bool:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
        SELECT 1
        FROM portfolio_holdings
        WHERE user_id = %s
        AND coin_id = %s
        LIMIT 1
        """

        cursor.execute(query, (user_id, coin_id))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result is not None

    def find_all_by_user(self, user_id: int) -> list[dict]:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT
            ph.user_id,
            ph.coin_id,
            c.symbol,
            c.name,
            ph.quantity,
            ph.average_buy_price,
            (
                SELECT price
                FROM price_history
                WHERE price_history.coin_id = ph.coin_id
                ORDER BY recorded_at DESC, id DESC
                LIMIT 1
            ) AS current_price
        FROM portfolio_holdings ph
        INNER JOIN coins c
            ON c.id = ph.coin_id
        WHERE ph.user_id = %s
        ORDER BY ph.updated_at DESC, ph.coin_id ASC
        """

        cursor.execute(query, (user_id,))
        holdings = cursor.fetchall()
        cursor.close()
        connection.close()
        return holdings

    def create_operation(self, operation) -> int:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO portfolio_operations
        (
            user_id, coin_id, operation_type, quantity, price_usd,
            fee_usd, executed_at, note, created_at, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """
        cursor.execute(
            query,
            (
                operation.user_id,
                operation.coin_id,
                operation.operation_type,
                operation.quantity,
                operation.price_usd,
                operation.fee_usd,
                operation.executed_at,
                operation.note,
            ),
        )
        connection.commit()
        operation_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return operation_id

    def find_operations_by_user(self, user_id: int) -> list[dict]:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT po.id, po.coin_id, c.symbol, c.name, po.operation_type,
               po.quantity, po.price_usd, po.fee_usd, po.executed_at, po.note,
               (
                   SELECT price FROM price_history
                   WHERE price_history.coin_id = po.coin_id
                   ORDER BY recorded_at DESC, id DESC LIMIT 1
               ) AS current_price
        FROM portfolio_operations po
        INNER JOIN coins c ON c.id = po.coin_id
        WHERE po.user_id = %s
        ORDER BY po.executed_at DESC, po.id DESC
        """
        cursor.execute(query, (user_id,))
        operations = cursor.fetchall()
        cursor.close()
        connection.close()
        return operations

    def find_operation(self, user_id: int, operation_id: int) -> dict | None:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT po.id, po.user_id, po.coin_id, c.symbol, c.name,
               po.operation_type, po.quantity, po.price_usd, po.fee_usd,
               po.executed_at, po.note
        FROM portfolio_operations po
        INNER JOIN coins c ON c.id = po.coin_id
        WHERE po.user_id = %s AND po.id = %s
        LIMIT 1
        """
        cursor.execute(query, (user_id, operation_id))
        operation = cursor.fetchone()
        cursor.close()
        connection.close()
        return operation

    def update_operation(self, operation) -> bool:
        connection = get_connection()
        cursor = connection.cursor()
        query = """
        UPDATE portfolio_operations
        SET coin_id = %s, operation_type = %s, quantity = %s,
            price_usd = %s, fee_usd = %s, executed_at = %s,
            note = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND user_id = %s
        """
        cursor.execute(
            query,
            (
                operation.coin_id,
                operation.operation_type,
                operation.quantity,
                operation.price_usd,
                operation.fee_usd,
                operation.executed_at,
                operation.note,
                operation.id,
                operation.user_id,
            ),
        )
        updated = cursor.rowcount > 0
        connection.commit()
        cursor.close()
        connection.close()
        return updated

    def delete_operation(self, user_id: int, operation_id: int) -> bool:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            "DELETE FROM portfolio_operations WHERE id = %s AND user_id = %s",
            (operation_id, user_id),
        )
        deleted = cursor.rowcount > 0
        connection.commit()
        cursor.close()
        connection.close()
        return deleted

    def get_net_quantity(
        self,
        user_id: int,
        coin_id: str,
        exclude_operation_id: int | None = None,
    ) -> float:
        connection = get_connection()
        cursor = connection.cursor()
        query = """
        SELECT COALESCE(
            SUM(CASE WHEN operation_type = 'buy' THEN quantity ELSE -quantity END),
            0
        )
        FROM portfolio_operations
        WHERE user_id = %s AND coin_id = %s
        """
        params: list[object] = [user_id, coin_id]
        if exclude_operation_id is not None:
            query += " AND id <> %s"
            params.append(exclude_operation_id)
        cursor.execute(query, tuple(params))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return float(result[0] or 0)
