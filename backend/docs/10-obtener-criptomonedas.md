# Módulo 10 - Obtener criptomonedas desde CoinGecko

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Endpoint utilizado

Crypto Tracker utiliza:

GET /coins/markets

Este endpoint devuelve información de mercado de criptomonedas.

## Flujo de datos

CoinGecko API

↓

JSON

↓

Dictionary Python

↓

Coin Object

## CoinGeckoService

Es responsable de comunicarse con la API externa.

No debe encargarse de crear modelos.

## Mapper

El mapper transforma datos externos en objetos internos.

Permite separar la estructura de CoinGecko de nuestra aplicación.

## Modelo Coin

Representa una criptomoneda dentro del sistema.

Tiene:

- id
- nombre
- símbolo
- precio
- ranking

## Arquitectura actual

```shell
main.py
    ↓
CoinGeckoService
    ↓
CoinMapper
    ↓
Coin Model

```
