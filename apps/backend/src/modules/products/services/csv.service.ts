import { Injectable, BadRequestException } from '@nestjs/common';
import csvParser from 'csv-parser';
import { createObjectCsvStringifier } from 'csv-writer';
import { ReadStream } from 'fs';

export interface CsvRow {
  [key: string]: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

@Injectable()
export class CsvService {
  parse<T = any>(stream: ReadStream, expectedHeaders: string[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      stream
        .pipe(csvParser())
        .on('data', (row: CsvRow) => {
          try {
            const validatedRow = this.validateRow(row, expectedHeaders);
            results.push(validatedRow as T);
          } catch (error) {
            errors.push({
              row: results.length + 1,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
        .on('end', () => {
          if (errors.length > 0) {
            reject(new BadRequestException({
              message: 'CSV parsing failed',
              errors,
            }));
          } else {
            resolve(results);
          }
        })
        .on('error', (error) => {
          reject(new BadRequestException({
            message: 'Invalid CSV file',
            error: error instanceof Error ? error.message : 'Unknown error',
          }));
        });
    });
  }

  generate<T>(data: T[], headers: { title: string; id: keyof T }[]): string {
    const records = data.map((item) => {
      const row: any = {};
      headers.forEach((header) => {
        row[header.id as string] = item[header.id] ?? '';
      });
      return row;
    });

    const csvStringifier = createObjectCsvStringifier({
      header: headers.map((h) => ({
        id: h.id as string,
        title: h.title,
      })),
    });

    return csvStringifier.stringifyRecords(records);
  }

  private validateRow(row: CsvRow, expectedHeaders: string[]): any {
    const validatedRow: any = {};

    for (const header of expectedHeaders) {
      const key = header.toLowerCase().replace(/\s+/g, '_');
      validatedRow[key] = row[header] || row[key] || null;
    }

    return validatedRow;
  }

  getExpectedHeaders(): string[] {
    return [
      'Name',
      'Description',
      'Price',
      'Category',
      'Stock',
      'Image URL',
      'Is Active',
    ];
  }
}