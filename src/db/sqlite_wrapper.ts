import sqlite3 from 'sqlite3';
import { Database, Statement } from 'sqlite3';
export function formatValue<T>(value: T): string {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    if (value === null || value === undefined) {
      return 'NULL';
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
    EQUAL = '=',
    NOT_EQUAL = '<>',
    LESS_THAN = '<',
    GREATER_THAN = '>',
    LESS_THAN_OR_EQUAL = '<=',
    GREATER_THAN_OR_EQUAL = '>=',
    LIKE = 'LIKE'
}

export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR'
}

export class FilterCondition {
    constructor(public field: string, public value: any, public type: FilterType) {}
}

export class FilterGroup {
    conditions: (FilterCondition | FilterGroup)[];
    operator: LogicalOperator;

    constructor(operator: LogicalOperator, conditions: (FilterCondition | FilterGroup)[]) {
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

    addGroup(operator: LogicalOperator, conditions: (FilterCondition | FilterGroup)[]): FilterBuilder {
        this.conditions.push(new FilterGroup(operator, conditions));
        return this;
    }

    build(): (FilterCondition | FilterGroup)[] {
        return this.conditions;
    }
}


export class SQLiteWrapper {
    private db: Database | null = null ;
    
     constructor(private dbPath: string) {}
     
     public async create(): Promise<SQLiteWrapper> {
        this.db = new sqlite3.Database(this.dbPath);
        return this;
     }
    private buildSqlQuery(filterBuilder?: FilterBuilder): { sql: string, values: any[] } {
        if (!filterBuilder) {
            return { sql: '', values: [] };
        }
    
        const conditions = filterBuilder.build();
        return this.processConditions(conditions);
    }

    public async select(tableName: string, filterBuilder?: FilterBuilder): Promise<any> {
        const { sql, values } = this.buildSqlQuery(filterBuilder);
        const fullSql = `SELECT * FROM ${tableName} ${sql ? `WHERE ${sql}` : ''}`;
        console.log(`[SELECT statement] ${simulateSqlQuery(fullSql, values)}`);
        try {
            const rows = await this.db?.all(fullSql, values);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    private processConditions(conditions: (FilterCondition | FilterGroup)[], operator: LogicalOperator = LogicalOperator.AND): { sql: string, values: any[] } {
        let sqlParts: string[] = [];
        let values: any[] = [];
    
        for (const condition of conditions) {
            if (condition instanceof FilterCondition) {
                sqlParts.push(`${condition.field} ${condition.type} ?`);
                values.push(condition.value);
            } else if (condition instanceof FilterGroup) {
                console.log(`[GROUP] ${JSON.stringify(condition)}`);
                const { sql, values: groupValues } = this.processConditions(condition.conditions, condition.operator);
                if (sql) {
                    sqlParts.push(`(${sql})`);
                    values.push(...groupValues);
                }
            }
            console.log(sqlParts);
        }
    
        return { sql: sqlParts.join(` ${operator} `), values };
    }
    
    
    
    
    
    public async insert(tableName: string, data: Record<string, any>): Promise<void> {
        const fields = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`;
        console.log(`[INSERT statement] ${simulateSqlQuery(sql, values)}`);

        try {
            await this.db?.run(sql, values);
        } catch (err) {
            throw err;
        }
    }
    


    public async bulkInsert(tableName: string, dataList: Record<string, any>[]): Promise<void> {
        if (dataList.length === 0) return;

        const fields = Object.keys(dataList[0]).join(', ');
        const placeholders = dataList.map(() => `(${Object.keys(dataList[0]).map(() => '?').join(', ')})`).join(', ');
        const values = dataList.flatMap(obj => Object.values(obj));

        const sql = `INSERT INTO ${tableName} (${fields}) VALUES ${placeholders}`;
        
        
        console.log(`[INSERT statement] ${sql}`);
        try {
            await this.db?.run(sql, values);
        } catch (err) {
            throw err;
        }
    }

// Close the database connection
    public async close(): Promise<void> {
        await this.db?.close();
    }
}
