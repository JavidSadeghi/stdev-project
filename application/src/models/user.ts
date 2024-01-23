import {
  Table,
  AllowNull,
  Column,
  Default,
  DataType,
  AutoIncrement,
  PrimaryKey,
  Model,
  HasMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { Friendships } from "./friendship";


export interface IUsers {
  id?: number;
  user_identification: string;
  user_first_name: string | null;
  user_last_name: string | null;
  user_age: number;
  user_email: string;
  user_password: string;
  creation_date_time?: Date;
}

@Table({
  tableName: "users",
  initialAutoIncrement: "1",
  timestamps: false
})


export class Users extends Model<IUsers> {
  @HasMany(() => Friendships, { as: "targetUser", foreignKey: "user_target_id" })
  @HasMany(() => Friendships, { as: "sourceUser", foreignKey: "user_source_id" })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  user_identification!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  user_first_name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  user_last_name!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  user_age!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  user_email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  user_password!: string;

  @AllowNull(false)
  @Default(new Date())
  @Column(DataType.DATE)
  creation_date_time!: Date;
}
