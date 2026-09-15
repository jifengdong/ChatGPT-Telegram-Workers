/* eslint-disable */
export default {
    env: { system_init_message: '你是一个得力的助手' },
    command: {
        help: {
            summary: '当前支持以下命令:\n',
            help: '获取命令帮助',
            new: '发起新的对话',
            start: '获取你的ID, 并发起新的对话',
            img: '生成一张图片, 命令完整格式为 `/img 图片描述`, 例如`/img 月光下的沙滩`',
            version: '获取当前版本号, 判断是否需要更新',
            system: '查看当前一些系统信息',
            redo: '重做上一次的对话, /redo 加修改过的内容 或者 直接 /redo',
            echo: '回显消息',
            models: '切换对话模型',
            admin: '打开管理后台 (Mini App)',
        },
        new: { new_chat_start: '新的对话已经开始' },
    },
    callback_query: {
        open_model_list: '打开模型列表',
        select_provider: '选择一个模型提供商:',
        select_model: '选择一个模型:',
        change_model: '对话模型已修改至',
        back: '返回',
    },
};
