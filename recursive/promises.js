const recursiveCalls = function(params) {
    return new Promise((resolve, reject) { //It might be any promise action
        resolve('Some action')
    }).then(data => {

            if(/* any statement here (recursive functions should allways have exit option)*/) {
                const newParams = Object.assign({}, params);
                return recursiveCalls(newParams);
            } 

            return data;
        });
}