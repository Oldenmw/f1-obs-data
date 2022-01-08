var Struct = require('../index.js').Struct;

var Person = Struct()
    .chars('firstName',10)
    .chars('lastName',10)
    .array('items',3,'chars',10)
    .word16Sle('balance'),
People = Struct()
    .word8('presentCount')
    .array('list',2,Person);


Person.allocate();
People.allocate();

console.log(People.buffer());
console.log(Person.buffer());