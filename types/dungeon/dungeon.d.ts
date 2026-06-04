export type BattleResponse = {
    message :  string,
    charHealth : number,
    monsterHealth ?: number
}

export type GetMonsterResponse = {
    message : string,
}

export type GetTrapResponse = {
    message : string,
    damage : number
}

export type GetItemResponse = {
    message : string,
    itemId : number
}