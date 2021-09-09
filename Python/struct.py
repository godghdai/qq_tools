import socket
import struct


def print_hex(buf):
    l = [hex(int(i)).replace("0x", "") for i in buf]
    print("<Buffer %s>" % " ".join(l))


def read_int32(buf):
    # print_hex(buf)
    # num=int.from_bytes(buf, byteorder='big')
    num2 = buf[3] | buf[2] << 8 | buf[1] << 16 | buf[0] << 24
    # print(num,num2)
    # print_hex(buf)
    return num2


def read_string(buf, i):
    length = buf[3 + i] | buf[2 + i] << 8 | buf[1 + i] << 16 | buf[i] << 24
    return str(buf[i + 4:i + 4 + length], "utf-8")


def to_utf8(str):
    buf = str.encode('utf-8')
    return struct.pack("!i{}s".format(len(buf)), len(buf), buf)


if __name__ == "__main__":
    b4 = bytes('C语言中文网8岁了', 'utf-8')
    print_hex(b4)
    print(str(b4, 'utf8'))
    print(repr(b4))

    # buffer = struct.pack("!" + str(len(b4)) + "s", b4)
    buffer = struct.pack("!ii5si", 35, 5, b'abcde', 111)
    # print(read_int32(buffer))
    # print(read_string(buffer, 4))
    # print_hex(buffer)

    print_hex(to_utf8('C语言中文网8岁了'))

    fp = open("D://Downloads/golang/testTcp/gequ.mp4", 'rb')
    data = fp.read(30)
    buffer = struct.pack("!i30s", 89323455, data)
    res = struct.unpack("!i30s", buffer)
    # print_hex(buffer)
    fp.close()

"""
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 6999))
server.listen(5)
while True:
    conn, addr = server.accept()
    print(conn, addr)
    while True:
        try:
            data = conn.recv(1024)  # 接收数据
            print('recive:', data.decode())  # 打印接收到的数据
            conn.send(data.upper())  # 然后再发送数据
        except ConnectionResetError as e:
            print('关闭了正在占线的链接！')
            break
    conn.close()
"""

"""
<	little-endian
>	big-endian	
!	network (= big-endian)

FORMAT	C TYPE	PYTHON TYPE	STANDARD SIZE	NOTES
x	pad byte	no value	 	 
c	char	string of length 1	1	 
b	signed char	integer	1	(3)
B	unsigned char	integer	1	(3)
?	_Bool	bool	1	(1)
h	short	integer	2	(3)
H	unsigned short	integer	2	(3)
i	int	integer	4	(3)
I	unsigned int	integer	4	(3)
l	long	integer	4	(3)
L	unsigned long	integer	4	(3)
q	long long	integer	8	(2), (3)
Q	unsigned long long	integer	8	(2), (3)
f	float	float	4	(4)
d	double	float	8	(4)
s	char[]	string	 	 
p	char[]	string	 	 
P	void *	integer	 	(5), (3)

"""
