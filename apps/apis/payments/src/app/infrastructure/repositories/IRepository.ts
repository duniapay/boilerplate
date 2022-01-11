export interface IRepository<T> {
    insert(item: T): Promise<void>;
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T>;
    update(id: number, item: T): Promise<void>;
    delete(id: number): Promise<void>;
  }