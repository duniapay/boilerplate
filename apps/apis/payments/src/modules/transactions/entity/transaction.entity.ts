import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({
  name: 'payments',
})
export class TransactionEntity {
  /**
   * UUID column
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Unique username column
   */
  @Column({ length: 255, unique: true })
  username: string;

  /**
   * Name column
   */
  @Column({ type: 'text' })
  name: string;

  /**
   * Email colum
   */
  @Column({ type: 'text', unique: true })
  email: string;

  /**
   * created date column
   */
  @CreateDateColumn()
  createdDate: Date;

  /**
   * updated date column
   */
  @UpdateDateColumn()
  updatedDate: Date;

  /**
   * delete date column
   */
  @DeleteDateColumn()
  deletedDate: Date;

  /**
   * Omit password from query selection
   */
  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return self;
  }
}
