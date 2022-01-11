import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Long } from "typeorm";
import { IRepository } from "./IRepository";

@Injectable()
export class Repository<T> implements IRepository<T> {

  constructor(
    @InjectRepository(Object)
    private readonly entityRepository: IRepository<T>,
  ) {}

  async update(id: number, item: T): Promise<void> {
    await this.entityRepository.update(id,item);
  }

  async insert(todo: T): Promise<void> {
    await this.entityRepository.insert(todo);
  }
  async getAll(): Promise<T[]> {
    const query = await this.entityRepository.getAll();
    return query;
  }
  async getById(id: number): Promise<T> {
    const query = await this.entityRepository.getById(id);
    return query;
  }
  async delete(id: number): Promise<void> {
    await this.entityRepository.delete( id);
  }

 
}