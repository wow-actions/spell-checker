export declare function parsePatch(patch: string): {
    type: 'added' | 'deleted';
    line: string;
    lineNumber: number;
}[];
