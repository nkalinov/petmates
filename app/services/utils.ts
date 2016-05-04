export class Utils {
    public static randomId():string {
        return Math.random().toString(36).substring(7);
    }
}