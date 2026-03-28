import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
  ssl: 'require'
}

const sql = postgres(config)

async function checkSchema() {
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE '%currenc%';
    `
    console.log('Tables matching "*currenc*":', tables.map(t => t.table_name))
    
    for (const row of tables) {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${row.table_name};
      `
      console.log(`Columns for ${row.table_name}:`, columns)
    }

  } catch (err) {
    console.error(err)
  } finally {
    await sql.end()
  }
}

checkSchema()
