var Message = {
    SERVER_ERROR: "服务器出错",
    LOGIN_ERROR: '邮箱与密码不匹配',
    LOGIN_FIRST: '请先登录',
    SIGNUP_ERROR: '对不起！注册失败',
    SIGNUP_SUCCESS: '恭喜你注册成功！请登录',
    EMAIL_REQUIRED: "邮箱不能为空",
    EMAIL_ERROR: "请输入有效的邮箱地址",
    USERNAME_REQUIRED: "昵称不能为空",
    PASSWORD_REQUIRED: "密码不能为空",
    PASSWORD_MIN_LENGTH: "密码至少需要 {0} 个字",
    PASSWORD_MAX_LENGTH: "密码不能超过 {0} 个字",
    EMAIL_NOT_EXISTED: "恭喜你！该邮箱可以使用",
    EMAIL_EXISTED: "对不起！此邮箱已被注册",
    TITLE_REQUIRED: "请输入标题",
    SNIPPET_REQUIRED: "请输入代码片段",
    CURRENT_PASSWORD_REQUIRED: "旧密码不能为空",
    NEW_PASSWORD_REQUIRED: "新密码不能为空",
    CONFIRM_PASSWORD_REQUIRED: "确认密码不能为空",
    PASSWORD_EQUAL_ERROR: "两次新密码不一致",
    PASSWORD_SAME_ERROR: "新密码与旧密码一致，请输入一个你当前未使用的密码",
    PASSWORD_SAVE_ERROR: "修改密码失败",
    PASSWORD_WRONG_ERROR: "旧密码不正确",
    //delete snippet
    DELETE_SNIPPET_CONFIRM: "确定要删除该代码片段？",
    DELETE_SNIPPET_SUCCESS: "成功删除代码片段",
    SNIPPET_NOT_EXSIT: "该代码片段不存在",
    DELETE_SNIPPET_FORBIDDEN: "你无权删除该代码片段",

    USER_NOT_EXSIT: "该用户不存在",
    UNSUBSCRIBE_SNIPPET_CONFIRM: "确定要取消收藏该代码片段？",
    UNFOLLOW_CONFIRM: "确定要取消关注该用户吗？",
    //update snippet
    UPDATE_SNIPPET_FORBIDDEN: "你无权修改该代码片段",
    UPDATE_SNIPPET_SUCCESS: "成功更新代码片段",
    //update profile
    UPDATE_PROFILE_FORBIDDEN: "你无权修改该用户资料",
    UPDATE_PROFILE_SUCCESS: "成功更新资料",
};

var Opertation = {
    FOLLOW: '关注',
    UNFOLLOW: '取消关注',
    FAVORITE: '收藏',
    UNSUBSCRIBE: '取消收藏'
};