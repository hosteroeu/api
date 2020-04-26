# SQL Queries for Reports

## Update SQL_MODE

`SELECT @@sql_mode;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';`

## Users No by Month and Year

`SELECT
    MONTHNAME(a.created_at) as month, YEAR(a.created_at) as year, COUNT(*) as users
FROM
    accounts a
GROUP BY YEAR(a.created_at) ASC, MONTH(a.created_at) ASC;`

## Payments No by Month and Year

`SELECT
    MONTHNAME(p.created_at) as month, YEAR(p.created_at) as year, COUNT(*) as payments
FROM
    payments p
GROUP BY YEAR(p.created_at) ASC, MONTH(p.created_at) ASC;`

## FIAT Payments Amount by Month and Year

`SELECT
    MONTHNAME(p.created_at) as month, YEAR(p.created_at) as year, SUM(p.amount) as amount
FROM
    payments p
WHERE p.gateway != 'webdollar'
GROUP BY YEAR(p.created_at) ASC, MONTH(p.created_at) ASC;`

## Active users

`select * from accounts where updated_at < DATE_SUB(NOW(),INTERVAL 2 MONTH);`
