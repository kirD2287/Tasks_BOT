import {Context as ContextTelegraf} from 'telegraf'

export interface TaskContext extends ContextTelegraf{
    session?: {
        type?: 'done' | 'edit' | 'delete' | 'create'
    }

}