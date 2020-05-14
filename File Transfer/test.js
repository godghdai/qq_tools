var buf=Buffer.allocUnsafe(4);//32位
console.log(buf)
buf.writeUInt32BE(150)
console.log(buf)
buf.writeUInt32LE(150)
console.log(buf)
//var num=buf.writeUInt32LE();
num=150
//num=bitset(num,7)
console.log(num,num.toString(2))
// var uint8 = new Uint8Array(2);
// uint8[0] = 42;
// console.log(uint8)
//128 64 32 16 8 4 2 1 
// a b c d e f
// 1010 1011 1100 1101 1110 1111           
//0001 0110

//128+32+10
console.log(0xaa);
console.log(0b11111111);
console.log(0o33);
// function bitset(num,w){
//     return num|1<<w-1
// }


// for (let w = 1; w <= 16; w++) {
//     console.log(1<<w-1)
// }

