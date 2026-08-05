import { Injectable } from '@angular/core';

import {
    FilterCondition,
    FilterGroup,
    FilterOperator
} from '../models/predicate-filter';

@Injectable({
    providedIn: 'root'
})
export class PredicateFilterService {

    evaluate<T>(
        item: T,
        group: FilterGroup
    ): boolean {

        const conditionResults = group.conditions.map(
            condition => this.evaluateCondition(item, condition)
        );

        const groupResults = group.groups.map(
            childGroup => this.evaluate(item, childGroup)
        );

        const results = [
            ...conditionResults,
            ...groupResults
        ];

        // Empty group means no filtering.
        if (results.length === 0) {
            return true;
        }

        if (group.logic === 'AND') {
            return results.every(Boolean);
        }

        return results.some(Boolean);
    }

    filter<T>(
        items: T[],
        group: FilterGroup
    ): T[] {

        if (this.isEmpty(group)) {
            return items;
        }

        return items.filter(item =>
            this.evaluate(item, group)
        );
    }

    private evaluateCondition<T>(
        item: T,
        condition: FilterCondition
    ): boolean {

        const actualValue =
            this.getValue(item, condition.field);

        const expectedValue =
            condition.value;

        switch (condition.operator) {

            case 'equals':
                return this.equals(
                    actualValue,
                    expectedValue
                );

            case 'notEquals':
                return !this.equals(
                    actualValue,
                    expectedValue
                );

            case 'contains':
                return String(actualValue ?? '')
                    .toLowerCase()
                    .includes(
                        String(expectedValue ?? '').toLowerCase()
                    );

            case 'startsWith':
                return String(actualValue ?? '')
                    .toLowerCase()
                    .startsWith(
                        String(expectedValue ?? '').toLowerCase()
                    );

            case 'endsWith':
                return String(actualValue ?? '')
                    .toLowerCase()
                    .endsWith(
                        String(expectedValue ?? '').toLowerCase()
                    );

            case 'greaterThan':
                return Number(actualValue) >
                    Number(expectedValue);

            case 'greaterThanOrEqual':
                return Number(actualValue) >=
                    Number(expectedValue);

            case 'lessThan':
                return Number(actualValue) <
                    Number(expectedValue);

            case 'lessThanOrEqual':
                return Number(actualValue) <=
                    Number(expectedValue);

            default:
                return false;
        }
    }

    private getValue<T>(
        item: T,
        field: string
    ): any {

        return field
            .split('.')
            .reduce(
                (value: any, key: string) =>
                    value?.[key],
                item
            );
    }

    private equals(
        actual: any,
        expected: any
    ): boolean {

        if (
            actual === null ||
            actual === undefined
        ) {
            return expected === null ||
                expected === undefined ||
                expected === '';
        }

        // Numeric comparison
        if (
            typeof actual === 'number' ||
            !isNaN(Number(actual))
        ) {

            const actualNumber = Number(actual);
            const expectedNumber = Number(expected);

            if (
                !isNaN(actualNumber) &&
                !isNaN(expectedNumber)
            ) {
                return actualNumber === expectedNumber;
            }
        }

        return String(actual).toLowerCase() ===
            String(expected).toLowerCase();
    }

    private isEmpty(
        group: FilterGroup
    ): boolean {

        return (
            group.conditions.length === 0 &&
            group.groups.length === 0
        );
    }

}