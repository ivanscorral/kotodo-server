/* eslint-disable @typescript-eslint/no-explicit-any */
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { FilterType } from './filterTypes';
import { simulateSqlQuery } from './dbLogging';
import { DatabaseOperationError, handleDatabaseError, DatabaseError } from './dbErrors';

export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR',
}

export interface SQLQuery {
  sql: string;
  values: (string | number)[];
}

export class FilterCondition {
  constructor(
        public field: string,
        public value: (string | number),
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

  addCondition(field: string, value: (string | number), type: FilterType): FilterBuilder {
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
  private db?: Database;

  constructor(private dbPath: string) {}

  public async create(): Promise<SQLiteWrapper> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });
    return this;
  }
  private buildSqlQuery(filterBuilder?: FilterBuilder): SQLQuery {
    if (!filterBuilder) {
      return { sql: '', values: [] };
    }

    const conditions = filterBuilder.build();
    return this.processConditions(conditions);
  }


  /**
 * Converts filter conditions/groups to SQL query parts.
 * @param conditions - Array of FilterCondition or FilterGroup.
 * @param operator - LogicalOperator (AND/OR), default AND.
 * @returns Object with SQL string and values array.
 */

  private processConditions(
    conditions: (FilterCondition | FilterGroup)[],
    operator: LogicalOperator = LogicalOperator.AND,
  ): SQLQuery {
    const values: (string | number)[] = [];
    
    const sql = conditions.map(condition => {
      if (condition instanceof FilterCondition) {
        values.push(condition.value);
        return `${condition.field} ${condition.type} ?`;
      }
      
      if (condition instanceof FilterGroup) {
        const { sql: groupSql, values: groupValues } = this.processConditions(
          condition.conditions,
          condition.operator
        );
        
        if (groupSql) {
          values.push(...groupValues);
          return `(${groupSql})`;
        }
        
      }
    }).filter(Boolean).join(` ${operator} `);
    
    return { sql, values };
  }

  public async insert(tableName: string, data: Record<string, any>): Promise<number> {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const sql = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`;
    
    try {
      const insertResult = await this.db?.run(sql, values);
      if (insertResult && typeof insertResult.lastID === 'number') {
        return insertResult.lastID;
      } else {
        throw new Error('Insert operation failed or lastID is not a number');
      }
    } catch (error) {
      console.error(`[INSERT ERROR] Failed to insert data: ${error}`);
      handleDatabaseError(error);
    }
  }
    
  public async delete(
    tableName: string,
    filterBuilder: FilterBuilder,
  ): Promise<{ affectedRows: number }> {
    // Build WHERE clause
    const { sql: whereSql, values: whereValues } = this.buildSqlQuery(filterBuilder);
    if (!whereSql) {
      throw new Error('No conditions provided for delete');
    }
    
    // Parameterized SQL query to prevent SQL injection
    const sql = `DELETE FROM ${tableName} WHERE ${whereSql}`;
    const values = whereValues;
    
    console.log(`[DELETE statement] ${simulateSqlQuery(sql, values)}`);
    
    try {
      // Assuming that db.run() returns an object with information about the query execution
      const result = await this.db?.run(sql, values);
      console.log('[DELETE result]', result);
      // Check if any rows were affected
      const affectedRows = result?.changes || 0;
    
      return { affectedRows };
    } catch (err) {
      console.error(`[DELETE ERROR] Failed to delete data from ${tableName}: ${err}`);
      handleDatabaseError(err);
    }
  }
    
  private async executeSelect(
    sql: string,
    values: any[],
  ): Promise<any> {
    console.log(`[SELECT statement] ${simulateSqlQuery(sql, values)}`);
    try {
      const results = await this.db?.all(sql, values);
      console.log(results);
      return results;
    } catch (err) {
      console.log(err);
      handleDatabaseError(err);
    }
  }
  
  public async selectAll(tableName: string, filterBuilder?: FilterBuilder): Promise<any> {
    try {
      const { sql, values } = this.buildWhereClause(filterBuilder);
      const fullSql = `SELECT * FROM '${tableName}'${sql ? ` WHERE ${sql}` : ''}`;
      return this.executeSelect(fullSql, values);
    } catch (err) {
      console.error(`[SELECT ERROR] Failed to select data from ${tableName}: ${err}`);
      handleDatabaseError(err);
    }
  }
  
  public async selectRows(rows: string[] | string, tableName: string, filterBuilder?: FilterBuilder): Promise<any> {
    const selectedRows = Array.isArray(rows) ? rows.join(', ') : rows;
    const { sql, values } = this.buildWhereClause(filterBuilder);
    const fullSql = `SELECT ${selectedRows} FROM '${tableName}'${sql ? ` WHERE ${sql}` : ''}`;
    return this.executeSelect(fullSql, values);
    
  }
    
  public async update(
    tableName: string,
    data: Record<string, any>,
    filterBuilder: FilterBuilder,
  ): Promise<void> {
    if (!Object.keys(data).length) {
      throw new DatabaseError(DatabaseOperationError.SQL_ERROR, 'No data provided to update');
    }
    
    // Build SET clause
    const setParts = Object.keys(data).map(key => `${key} = ?`);
    const setSql = setParts.join(', ');
    const setValues = Object.values(data);
    
    // Build WHERE clause
    const { sql: whereSql, values: whereValues } = this.buildSqlQuery(filterBuilder);
    
    if (!whereSql) {
      throw new DatabaseError(DatabaseOperationError.SQL_ERROR, 'No conditions provided for update');
    }
    
    const sql = `UPDATE ${tableName} SET ${setSql} WHERE ${whereSql}`;
    const values = [...setValues, ...whereValues];
    
    console.log(`[UPDATE statement] ${simulateSqlQuery(sql, values)}`);
    
    try {
      const result = await this.db?.run(sql, values);
      console.log('[UPDATE result]', result);
    } catch (err) {
      console.error(`[UPDATE ERROR] ${err}`);
      handleDatabaseError(err);
    }
  }
  
  private buildWhereClause(filterBuilder?: FilterBuilder): { sql: string, values: any[] } {
    if (!filterBuilder) {
      return { sql: '', values: [] };
    }
    const conditions = filterBuilder.build();
    return this.processConditions(conditions);
  } 
    
    

  public async bulkInsert(
    tableName: string,
    dataList: Record<string, any>[],
  ): Promise<number> {
    if (dataList.length === 0) return 0;

    const fields = Object.keys(dataList[0]).join(', ');
    const placeholders = dataList
      .map(
        () =>
          `(${Object.keys(dataList[0])
            .map(() => '?')
            .join(', ')})`,
      )
      .join(', ');
    const values = dataList.flatMap((obj) => Object.values(obj));

    const sql = `INSERT INTO ${tableName} (${fields}) VALUES ${placeholders}`;

    console.log(`[INSERT statement] ${sql}`);
    try {
      const insertResult = await this.db?.run(sql, values);
      if (insertResult && typeof insertResult.lastID === 'number') {
        return insertResult.lastID;
      } else {
        throw new Error('Insert operation failed or lastID is not a number');
      }
    } catch (error) {
      console.error(`[ERROR] Failed to insert data: ${error}`);
      handleDatabaseError(error);
    }
  }
  
  
  // Close the database connection
  public async close(): Promise<void> {
    await this.db?.close();
  }
  
}
