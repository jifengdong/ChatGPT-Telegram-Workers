/* eslint-disable */
export default {
    env: { system_init_message: 'You are a helpful assistant' },
    command: {
        help: {
            summary: 'The following commands are currently supported:\n',
            help: 'Get command help',
            new: 'Start a new conversation',
            start: 'Get your ID and start a new conversation',
            img: 'Generate an image, the complete command format is `/img image description`, for example `/img beach at moonlight`',
            version: 'Get the current version number to determine whether to update',
            system: 'View some system information',
            redo: 'Redo the last conversation, /redo with modified content or directly /redo',
            echo: 'Echo the message',
            models: 'switch chat model',
            admin: 'Open the admin panel (Mini App)',
        },
        new: { new_chat_start: 'A new conversation has started' },
    },
    callback_query: {
        open_model_list: 'Open models list',
        select_provider: 'Select a provider:',
        select_model: 'Choose model:',
        change_model: 'Change model to ',
        back: 'Back',
    },
};
