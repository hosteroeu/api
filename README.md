# Medusa

`SELECT COUNT(m.id) as miners, h.account_id, a.name, a.email FROM hosts as h LEFT JOIN accounts as a ON h.account_id = a.id LEFT JOIN miners as m ON m.host_id = h.id GROUP BY account_id;`

`export $(cat .env | xargs)`
