/* eslint-disable @typescript-eslint/no-explicit-any */
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
export function formatValue<T>(value: T): string {
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (value === null || value === undefined) {
    return "NULL";
  }
  return value.toString();
}

export function simulateSqlQuery(query: string, params: any[]): string {
  let index = 0;
  const result = query.replace(/\?/g, () => {
    const value = params[index++];
    return formatValue(value);
  });
  return result;
}

export enum FilterType {
    EQUAL = "=",
    NOT_EQUAL = "<>",
    LESS_THAN = "<",
    GREATER_THAN = ">",
    LESS_THAN_OR_EQUAL = "<=",
    GREATER_THAN_OR_EQUAL = ">=",
    LIKE = "LIKE",
}

export enum LogicalOperator {
    AND = "AND",
    OR = "OR",
}

export class FilterCondition {
  constructor(
        public field: string,
        public value: any,
        public type: FilterType,
  ) {}
}

export class FilterGroup {
  conditions: (FilterCondition | FilterGroup)[];
  operator: LogicalOperator;

  constructor(
    operator: LogicalOperator,
    conditions: (FilterCondition | FilterGroup)[],
  ) {
    this.operator = operator;
    this.conditions = conditions;
  }
}

export class FilterBuilder {
  private conditions: (FilterCondition | FilterGroup)[] = [];

  addCondition(field: string, value: any, type: FilterType): FilterBuilder {
    this.conditions.push(new FilterCondition(field, value, type));
    return this;
  }

  addGroup(
    operator: LogicalOperator,
    conditions: (FilterCondition | FilterGroup)[],
  ): FilterBuilder {
    this.conditions.push(new FilterGroup(operator, conditions));
    return this;
  }

  build(): (FilterCondition | FilterGroup)[] {
    return this.conditions;
  }
}

export class SQLiteWrapper {
  private db: Database | null = null;

  constructor(private dbPath: string) {}

  public async create(): Promise<SQLiteWrapper> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });
    return this;
  }
  private buildSqlQuery(filterBuilder?: FilterBuilder): {
        sql: string;
        values: any[];
    } {
    if (!filterBuilder) {
      return { sql: "", values: [] };
    }

    const conditions = filterBuilder.build();
    return this.processConditions(conditions);
  }

  public async selectAll(
    tableName: string,
    filterBuilder?: FilterBuilder,
  ): Promise<any> {
    const { sql, values } = this.buildSqlQuery(filterBuilder);
    let fullSql = `SELECT * FROM '${tableName}'`;
    if (sql) {
      fullSql += ` WHERE ${sql}`;
    }
    console.log(`[SELECT statement] ${simulateSqlQuery(fullSql, values)}`);
    try {
      const results = await this.db?.all(fullSql, values);
      console.log(results);
      return results;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  public async selectRows(
    rows: string[] | string,
    tableName: string,
    filterBuilder?: FilterBuilder,
  ): Promise<any> {
    const selectedRows = Array.isArray(rows) ? rows.join(", ") : rows;
    const { sql, values } = this.buildSqlQuery(filterBuilder);
    let fullSql = `SELECT ${selectedRows} FROM '${tableName}'`;
    if (sql) {
      fullSql += ` WHERE ${sql}`;
    }
    console.log(`[SELECT statement] ${simulateSqlQuery(fullSql, values)}`);
    try {
      const results = await this.db?.all(fullSql, values);
      console.log(results);
      return results;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
    
  private processConditions(
    conditions: (FilterCondition | FilterGroup)[],
    operator: LogicalOperator = LogicalOperator.AND,
  ): { sql: string; values: any[] } {
    const sqlParts: string[] = [];
    const values: any[] = [];

    for (const condition of conditions) {
      if (condition instanceof FilterCondition) {
        sqlParts.push(`${condition.field} ${condition.type} ?`);
        values.push(condition.value);
      } else if (condition instanceof FilterGroup) {
        console.log(`[GROUP] ${JSON.stringify(condition)}`);
        const { sql, values: groupValues } = this.processConditions(
          condition.conditions,
          condition.operator,
        );
        if (sql) {
          sqlParts.push(`(${sql})`);
          values.push(...groupValues);
        }
      }
      console.log(sqlParts);
    }

    return { sql: sqlParts.join(` ${operator} `), values };
  }

  public async insert(tableName: string, data: Record<string, any>): Promise<number> {
    const fields = Object.keys(data).join(", ");
    const placeholders = Object.keys(data).map(() => "?").join(", ");
    const values = Object.values(data);
    const sql = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`;
    
    try {
      const insertResult = await this.db?.run(sql, values);
      if (insertResult && typeof insertResult.lastID === "number") {
        return insertResult.lastID;
      } else {
        throw new Error("Insert operation failed or lastID is not a number");
      }
    } catch (error) {
      console.error(`[ERROR] Failed to insert data: ${error}`);
      throw error;
    }
  }
    
  public async delete(
    tableName: string,
    filterBuilder: FilterBuilder,
  ): Promise<{ affectedRows: number }> {
    // Build WHERE clause
    const { sql: whereSql, values: whereValues } = this.buildSqlQuery(filterBuilder);
    if (!whereSql) {
      throw new Error("No conditions provided for delete");
    }
    
    // Parameterized SQL query to prevent SQL injection
    const sql = `DELETE FROM ${tableName} WHERE ${whereSql}`;
    const values = whereValues;
    
    console.log(`[DELETE statement] ${simulateSqlQuery(sql, values)}`);
    
    try {
      // Assuming that db.run() returns an object with information about the query execution
      const result = await this.db?.run(sql, values);
      console.log("[DELETE result]", result);
      // Check if any rows were affected
      const affectedRows = result?.changes || 0;
    
      return { affectedRows };
    } catch (err) {
      console.error(`[ERROR] Failed to delete data from ${tableName}: ${err}`);
      throw err;
    }
  }
    

    
  public async update(
    tableName: string,
    data: Record<string, any>,
    filterBuilder: FilterBuilder,
  ): Promise<void> {
    if (!Object.keys(data).length) {
      throw new Error("No data provided to update");
    }
    
    // Build SET clause
    const setParts = Object.keys(data).map(key => `${key} = ?`);
    const setSql = setParts.join(", ");
    const setValues = Object.values(data);
    
    // Build WHERE clause
    const { sql: whereSql, values: whereValues } = this.buildSqlQuery(filterBuilder);
    if (!whereSql) {
      throw new Error("No conditions provided to update");
    }
    
    const sql = `UPDATE ${tableName} SET ${setSql} WHERE ${whereSql}`;
    const values = [...setValues, ...whereValues];
    
    console.log(`[UPDATE statement] ${simulateSqlQuery(sql, values)}`);
    
    try {
      const result = await this.db?.run(sql, values);
      console.log("[UPDATE result]", result);
    } catch (err) {
      console.error(`[ERROR] Failed to update data: ${err}`);
      throw err;
    }
  }
    
    

  public async bulkInsert(
    tableName: string,
    dataList: Record<string, any>[],
  ): Promise<number> {
    if (dataList.length === 0) return 0;

    const fields = Object.keys(dataList[0]).join(", ");
    const placeholders = dataList
      .map(
        () =>
          `(${Object.keys(dataList[0])
            .map(() => "?")
            .join(", ")})`,
      )
      .join(", ");
    const values = dataList.flatMap((obj) => Object.values(obj));

    const sql = `INSERT INTO ${tableName} (${fields}) VALUES ${placeholders}`;

    console.log(`[INSERT statement] ${sql}`);
    try {
      const insertResult = await this.db?.run(sql, values);
      if (insertResult && typeof insertResult.lastID === "number") {
        return insertResult.lastID;
      } else {
        throw new Error("Insert operation failed or lastID is not a number");
      }
    } catch (error) {
      console.error(`[ERROR] Failed to insert data: ${error}`);
      throw error;
    }
  }

  // Close the database connection
  public async close(): Promise<void> {
    await this.db?.close();
  }
}
