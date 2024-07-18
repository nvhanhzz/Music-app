export const generateOTP = (length: number): string => {
    const digits = "0123456789";

    let result = "";

    for (let i = 0; i < length; ++i) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return result;
}