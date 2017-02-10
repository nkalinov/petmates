export interface IResponseUpload {
    success: boolean;
    data?: {
        destination: string;
        encoding: string;
        fieldname: string;
        filename: string;
        mimetype: string;
        originalname: string;
        path: string;
        size: number;
        url: string;
    };
    msg?: string;
}
