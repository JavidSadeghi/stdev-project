import {
  Table,
  AllowNull,
  Column,
  Default,
  DataType,
  AutoIncrement,
  PrimaryKey,
  Model,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { Users } from "./user";


export interface IFriendships {
  id?: number;
  user_source_id: number;
  user_target_id: number;
  status: string;
  creation_date_time?: Date;
}

@Table({
  tableName: "friendships",
  initialAutoIncrement: "1",
  timestamps: false
})


export class Friendships extends Model<IFriendships> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Users)
  @BelongsTo(() => Users, { as: "sourceUser", foreignKey: "user_source_id" })
  @Column(DataType.INTEGER)
  user_source_id!: number;

  @ForeignKey(() => Users)
  @BelongsTo(() => Users, { as: "targetUser", foreignKey: "user_target_id" })
  @Column(DataType.INTEGER)
  user_target_id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  status!: string;

  @AllowNull(false)
  @Default(new Date())
  @Column(DataType.DATE)
  creation_date_time!: Date;
}
