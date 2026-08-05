export type FilterLogic = 'AND' | 'OR';

export type FilterOperator =
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'lessThan'
    | 'lessThanOrEqual';

export interface FilterCondition {
    field: string;
    operator: FilterOperator;
    value: any;
}

export interface FilterGroup {
    logic: FilterLogic;
    conditions: FilterCondition[];
    groups: FilterGroup[];
}