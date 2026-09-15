/* eslint-disable */
export default {
    env: { system_init_message: '你是一個得力的助手' },
    command: {
        help: {
            summary: '當前支持的命令如下：\n',
            help: '獲取命令幫助',
            new: '開始一個新對話',
            start: '獲取您的ID並開始一個新對話',
            img: '生成圖片，完整命令格式為`/img 圖片描述`，例如`/img 海灘月光`',
            version: '獲取當前版本號確認是否需要更新',
            system: '查看一些系統信息',
            redo: '重做上一次的對話 /redo 加修改過的內容 或者 直接 /redo',
            echo: '回显消息',
            models: '切換對話模式',
            admin: '打開管理後台 (Mini App)',
        },
        new: { new_chat_start: '開始一個新對話' },
    },
    callback_query: {
        open_model_list: '打開模型清單',
        select_provider: '選擇一個模型供應商:',
        select_model: '選擇一個模型:',
        change_model: '對話模型已經修改至',
        back: '返回',
    },
};
