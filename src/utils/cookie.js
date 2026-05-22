import Cookies from "js-cookie";

const tokenKey = "OJ-Admin-Token";

//请求时获取token
export function getToken() {
    return Cookies.get(tokenKey);
}

//登录成功存储到Cookie
export function setToken(token) {
    return Cookies.set(tokenKey,token);
}

//退出登录时要用到 删除Cookie中的值
export function removeToken() {
    return Cookies.remove(tokenKey);
}
