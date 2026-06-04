export function changeMinToSec(second : number) : string {
    const min : number = Math.floor(second % 60);
    const sec : number = second % 60;

    const perceMin : string = min < 10 ? "0" + String(min) : String(min);
    const perceSec : string = sec < 10 ? "0" + String(sec) : String(sec);
    
    return perceMin + " : " + perceSec;
}