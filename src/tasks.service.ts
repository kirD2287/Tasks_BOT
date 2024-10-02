import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './Task.entity';
import { Repository } from 'typeorm';


@Injectable()
export class TasksService {
  constructor(@InjectRepository(TaskEntity) private readonly taskRepository: Repository<TaskEntity>) {

  }

  async createTask(name:string) {
    const task = this.taskRepository.create({name})
    await this.taskRepository.save(task)
    return this.getAllTasks()
  }
  async getAllTasks() {
    const tasks = await this.taskRepository.find()
    return tasks
  }

  async getById(id: number) {
    const task = await this.taskRepository.findOneBy({id})
    return task
  }

  async doneTask(id: number) {
    const task = await this.getById(id)
    if(!task) {
      return null
    }
    task.isCompleted = !task.isCompleted
    await this.taskRepository.save(task)
    return this.getAllTasks()
  }

  async editTask(id: number, name: string) {
    const task = await this.getById(id)
    if(!task) {
      return null
    }
      task.name= name
    await this.taskRepository.save(task)

    return this.getAllTasks()
  }
 
  async deleteTask(id: number) {
    const task = await this.getById(id)
    if(!task) {
      return null
    }
    await this.taskRepository.delete({id})
    return this.getAllTasks()
  }
}
