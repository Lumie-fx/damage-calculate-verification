export default {
  queryValueType: (value)=>{
    //Object Array String Number Undefined Boolean Null Function
    return Object.prototype.toString.call(value).slice(8,-1);
  }
}