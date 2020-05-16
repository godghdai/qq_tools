function Node(val,next){
    this.val=val;
    this.next=next||null;
}
function LinkedList(){
    this.head=new Node(null);
    this.last=this.head;
    this.length=0;
    this.toString=LinkedList.prototype.toString;
}
LinkedList.prototype.insertNode=function(index,val) {
   
}
LinkedList.prototype.foreach=function(){
    var cur=this.head;
    while(cur.next){
        console.log(cur.next.val)
        cur=cur.next;
    }
    console.log("----------------",this.length)
}

LinkedList.prototype.print=function(){
    var arr=[];
    var cur=this.head;
    while(cur.next){
        arr.push(cur.next.val)
        cur=cur.next;
    }
    console.log(arr.join(","));
}

LinkedList.prototype.push=function(val) {
    var node=new Node(val);
    this.last.next=node;
    this.last=node;
    this.length++;
    return node;
}

LinkedList.prototype.unshift=function(val) {
    var cur=this.head;
    var node=new Node(val);
    if(cur.next!=null){
        node.next=cur.next;
        cur.next=node;
    }else{
        this.last=node;
        cur.next=node;
    }
    this.length++;
    return node;
}


LinkedList.prototype.shift=function() {
    var cur=this.head;
    if(cur.next==null){
        this.last=this.head;
        return null;
    } 
       
    var node=cur.next;
    cur.next=cur.next.next;
    this.length--;
   
    return node;
}

LinkedList.prototype.remove=function(node) {

    if(!(node instanceof Node)) 
        return;

    var cur=this.head;
    while(cur.next){
        if(cur.next==node){
             //删除最后一个节点
            if(node==this.last){
                this.last=cur;
            }
            cur.next=cur.next.next;
            this.length--;
            break;
        }
        cur=cur.next;
    }
}

var list=new LinkedList();
list.push(1);
var node2=list.push(2);
list.push(3);
var node4=list.push(4);
list.remove(node2);
list.remove(node4);
list.print();
list.push(444);
list.push(445);
list.print();
list.unshift(3333);
list.push("abc")
list.unshift(4444);
var temp_node=list.unshift(5555);
list.unshift(77777);
list.push("cdef")
list.print();
list.remove(temp_node);
list.unshift(999);
list.push("cdepppf")
list.print();

temp_node=list.shift();
console.log(temp_node.val)
list.print();

temp_node=list.shift();
console.log(temp_node.val)
list.print();



