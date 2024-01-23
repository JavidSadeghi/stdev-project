import { QueryTypes } from "sequelize";
import { sequelize } from "../../models";

export const paginate = async (
  model: any,
  args: any,
  page: number | null,
  limit: number | null
) => {
  page = Number(page);
  page = !page || page < 1 ? 1 : page;
  limit = limit || Number(20);
  const { count, rows } = await model.findAndCountAll({
    ...args,
    limit: limit,
    offset: limit * (page - 1)
  });
  return {
    data: rows,
    meta: {
      total: count,
      total_pages: Math.ceil(count / limit),
      current_page: page,
      limit: limit,
      has_prev_page: page > 1,
      has_next_page: count > page * limit,
      prev_page: page > 1 ? page - 1 : null,
      next_page: count > page * limit ? page + 1 : null
    }
  };
};

export const paginateWithGroupBy = async (
  model: any,
  args: any,
  page: number | null,
  limit: number | null
) => {
  page = Number(page);
  page = !page || page < 1 ? 1 : page;
  limit = limit || Number(20);
  let query = "";
  const setQuery = (q: any) => (query = q);
  const rows = await model.findAll({
    ...args,
    limit: limit,
    offset: limit * (page - 1),
    logging: setQuery
  });
  query = query
    ?.replace("Executing (default): ", "")
    ?.replace(";", "")
    ?.replace(" LIMIT " + limit, "")
    ?.replace(" OFFSET " + limit * (page - 1), "");
  const countQuery = `SELECT COUNT(*) as count FROM (${query}) as count`;
  const result: any = await sequelize.query(countQuery as any, {
    type: QueryTypes.SELECT,
    plain: true
  });
  const count = +result?.count || 0;
  return {
    data: rows,
    meta: {
      total: count,
      total_pages: Math.ceil(count / limit),
      current_page: page,
      limit: limit,
      has_prev_page: page > 1,
      has_next_page: count > page * limit,
      prev_page: page > 1 ? page - 1 : null,
      next_page: count > page * limit ? page + 1 : null
    }
  };
};
