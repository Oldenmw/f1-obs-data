"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TyreStintsHistoryDataParser = void 0;
const F1Parser_1 = require("../F1Parser");
class TyreStintsHistoryDataParser extends F1Parser_1.F1Parser {
    constructor() {
        super();
        this.endianess('little')
            .uint8('m_endLap')
            .uint8('m_tyreActualCompound')
            .uint8('m_tyreVisualCompound');
    }
}
exports.TyreStintsHistoryDataParser = TyreStintsHistoryDataParser;
//# sourceMappingURL=TyreStintsHistoryDataParser.js.map