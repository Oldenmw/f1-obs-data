/// <reference types="node" />
import { Parser } from 'binary-parser';
export declare class F1Parser extends Parser {
    /**
     *
     * @param {Buffer} buffer
     */
    fromBuffer(buffer: Buffer): Parser.Parsed<any>;
}
