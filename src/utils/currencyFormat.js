export const currencyFormat = (num) => {
    return Intl.NumberFormat('en-US').format(num);
}