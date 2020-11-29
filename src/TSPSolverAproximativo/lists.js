function* combinations(arr, l) {

    const stack = [];
    const result = [];

    function* recurse(of, startFrom, arr) {
        const left = arr.slice(startFrom, arr.length);

        if (of.length === l) {
            yield of;
        }

        for (let i = 0; i < left.length; i++) {
            stack.push([[...of, left[i]], startFrom + i + 1, arr]);
        }
    }

    for (let i = 0; i < arr.length; i++) {
        stack.push([[arr[i]], i +1, arr]);
    }

    while(stack.length) {
        yield* recurse.apply(null, stack.pop());
    }

    return result;
}

module.exports = {
    combinations
};