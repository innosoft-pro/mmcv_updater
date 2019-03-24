export function isPositive(value) {
    return (parseInt(value).toString() == value && !isNaN(parseInt(value)) && parseInt(value) > 0);
}

export function checkIsPositiveValidator(rule, value, callback) {
    if (value && isPositive(value)) {
        callback();
    } else {
        if (value === '') {
            callback(); // empty case handled in different place else
        } else {
            callback(rule.message);
        }
    }
}

export function translateDirection(direction) {
    const directionToTranslation = {
        'forward': 'вперёд',
        'backward': 'назад'
    };
    return directionToTranslation[direction];
}
