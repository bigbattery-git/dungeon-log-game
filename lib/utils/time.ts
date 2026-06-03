export function changeMinToSec(second : number) : string {
    const min : number = Math.floor(second % 60);
    const sec : number = second % 60;

    let perceMin : string = min < 10 ? "0" + String(min) : String(min);
    let perceSec : string = sec < 10 ? "0" + String(sec) : String(sec);
    
    return perceMin + " : " + perceSec;
}