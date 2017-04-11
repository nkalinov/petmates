const dotProp = require('dot-prop-immutable');

export function setInArrayById<T>(state: T[], id: string, prop: string, value: any, idKey: string = '_id'): T[] {
    const index = state.findIndex(item => item[idKey] === id);

    if (index > -1) {
        return [
            ...state.slice(0, index),
            dotProp.set(state[index], prop, value),
            ...state.slice(index + 1)
        ]
    }

    return state;
}
