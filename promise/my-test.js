const Promise = require('./promise')

let p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1)
    }, 1000)
})
p.then((v) => {
    console.log(v)
})
// 所有的自测已经在刚才的vscode灾难中灰飞烟灭了，所以没有自测代码可以参考
// 自测方式：先跑 test suit，然后针对某一个未通过的 case
//          （只要不是被测代码抛错，基本上就是响应超时，即由于你的 promise 的实现错误，测试用例运行到某处终止了），
//          直接看该 case 涉及到的测试代码。
//          测试代码参考 /promises-tests/lib/tests/ 下的所有文件
//          Promise 的 test suit 有一些自己的设计，所以需要稍微花点耐心将目标 case 提取出来