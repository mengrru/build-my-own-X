module.exports = [
    {
        rows: [
            '(define circle-area (lambda (r) (* pi (* r r))))',
            '(circle-area 3)'
        ],
        result: 28.274333877
    },
    {
        rows: [
            '(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))',
            '(fact 10)'
        ],
        result: 3628800
    },
    /*
    {
        rows: [
            '(define first car)',
            '(define rest cdr)',
            '(define count (lambda (item L) (if L (+ (equal? item (first L)) (count item (rest L))) 0)))',
            '(count 0 (list 0 1 2 3 0 0))'
        ],
        result: 3
    },
    {
        rows: [
            '(count (quote the) (quote (the more the merrier the bigger the better)))'
        ],
        result: 4
    },
    */
    {
        rows: [
            '(define twice (lambda (x) (* 2 x)))',
            '(twice 5)'
        ],
        result: 10
    },
    {
        rows: [
            '(define repeat (lambda (f) (lambda (x) (f (f x)))))',
            '((repeat twice) 10)'
        ],
        result: 40
    },
    {
        rows: [
            '((repeat (repeat twice)) 10)'
        ],
        result: 160
    },
    {
        rows: [
            '((repeat (repeat (repeat twice))) 10)'
        ],
        result: 2560
    },
    {
        rows: [
            '((repeat (repeat (repeat (repeat twice)))) 10)'
        ],
        result: 655360
    },
    {
        rows: [
            '(pow 2 16)'
        ],
        result: 65536.0
    },
    {
        rows: [
            '(define fib (lambda (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2))))))',
            '(define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))',
            '(range 0 10)'
        ],
        result: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    /*
    {
        rows: [
            '(map fib (range 0 10))'
        ],
        result: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
    },
    {
        rows: [
            '(map fib (range 0 20))'
        ],
        result: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377,
                610, 987, 1597, 2584, 4181, 6765]
    }
    */
]