
import { TasksService } from './tasks.service';
import { Action, Ctx, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf, session } from 'telegraf';
import * as dotenv from 'dotenv';
import { actionButtons } from './app.buttons';
import { showList } from './app.utils';
import { TaskContext } from './context.interface';

dotenv.config()



@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<TaskContext>, 
    private readonly tasksService:TasksService) {}

  @Start()
  async startCommand(ctx: TaskContext) {
    await ctx.reply('Добрый день. Посмотри список своих задач', actionButtons())
  }


  @Action('create')
  async createTask(ctx: TaskContext) {
    this.bot.use(session())
    ctx.session.type = 'create'
    await ctx.reply('Опиши задачу: ')
  }

  @Action('list')
  async listTasks(ctx:TaskContext) {
    this.bot.use(session())
    const tasks = await this.tasksService.getAllTasks()
    await ctx.reply(showList(tasks), actionButtons())
  }

  @Action('done')
  async doneTask(ctx:TaskContext) {
    this.bot.use(session())
    await ctx.reply('Напиши ID задачи:')
    ctx.session.type = 'done'
  }

  @Action('edit')
  async editTask(ctx:TaskContext) {
    this.bot.use(session())
    ctx.session.type = 'edit'
    await ctx.deleteMessage()
    await ctx.replyWithMarkdownV2(
      'Напиши ID  и новое название задачи: \n\n' +
      'В формате - *1 | Новое название*',
      { parse_mode: 'HTML' }
    )
  }

  @Action('delete')
  async deleteTask(ctx:TaskContext) {
    this.bot.use(session())
    await ctx.reply('Напиши ID задачи:')
    ctx.session.type = 'delete'
  }

  @On('text')
  async getMessage(@Message('text') message:string, @Ctx() ctx:TaskContext){
  
    switch(ctx.session.type) {
      case 'create': 
        const createTaskName = message
        const createTasks = await this.tasksService.createTask(createTaskName)
        await ctx.reply(showList(createTasks), actionButtons())
        break
        
    
      case 'done': 
        const doneTasks = await this.tasksService.doneTask(Number(message))
        if(!doneTasks) {
          await ctx.deleteMessage()
          ctx.reply('Задачи с таким ID не найдено!')
        return
    }
        await ctx.reply(showList(doneTasks), actionButtons())
        break
    
      case 'edit':
        const [taskId, taskName] = message.split(' | ')
        const editTasks = await this.tasksService.editTask(Number(taskId), taskName)
      
        if(!editTasks) {
          await ctx.deleteMessage()
          ctx.reply('Задачи с таким ID не найдено!')
      return
    }
      await ctx.reply(showList(editTasks), actionButtons())
      break

      case 'delete':
        const deleteTasks = await this.tasksService.deleteTask(Number(message))
        if(!deleteTasks) {
          await ctx.deleteMessage()
          ctx.reply('Задачи с таким ID не найдено!')
      return
    }
    
      await ctx.reply(showList(deleteTasks), actionButtons())
      break
    }
    
  }
}



