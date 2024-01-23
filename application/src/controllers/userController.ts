import { NextFunction, Request, Response, RequestHandler } from "express";
import { Users, Friendships } from "../models";
import { Op } from "sequelize";
import { paginate } from "../services/paginate.ts";
import friendshipStatus from "../utils/friendshipStatus";

export const userDetail: RequestHandler = async (req: Request, res: Response) => {
    if(!req.userId) res.unauthorized({ message: "User identification is required!" });

    // check if user exist
    const userExist = await Users.findOne({
      where: { user_identification: req.userId },
      attributes: ["user_first_name", "user_last_name", "user_age", "user_email", "creation_date_time"]
    });
      
    if(!userExist) return res.notFound({ message: "User not found!" });

    res.done({ ...userExist?.dataValues })    
}

export const userSearch: RequestHandler = async (req: Request, res: Response) => {
    if(!req.userId) res.unauthorized({ message: "User identification is required!" });

    const { first_name: firstName, last_name: lastName, age: userAge, page: pageQuery, limit: limitQuery } = req.query;

    const page: number = pageQuery ? Number(pageQuery) : 1;
    const limit: number = limitQuery ? Number(limitQuery) : 10;

    // if each of them are sent as a query parameter
    let where: any = {};
    if(firstName) where.user_first_name = firstName;
    if(lastName) where.user_last_name = lastName;
    if(userAge) where.user_age = +userAge;

    // check if user exist
    const users = await paginate(
      Users,
      {
        where: { ...where },
          attributes: ["user_identification", "user_first_name", "user_last_name", "user_age", "user_email"]
      },
      page,
      limit
    ) 

    res.ok({ users })
}

export const userAddFriend: RequestHandler = async (req: Request, res: Response) => {
    if(!req.userId) res.unauthorized({ message: "User identification is required!" });

    const { friend_id } = req.params;

    if(!friend_id) res.unauthorized({ message: "Friend identification is required!" });

    if(req.userId === friend_id) res.badRequest({ message: "You cannot send friendship request to yourself!" });

    // check if user exist
    const userExist = await Users.findOne({
      where: { user_identification: req.userId },
      attributes: ["id"]
    });
          
    if(!userExist) return res.notFound({ message: "User not found!" });

    // check if friend exist
    const friendExist = await Users.findOne({
      where: { user_identification: friend_id },
      attributes: ["id"]
    });
              
    if(!friendExist) return res.notFound({ message: "User not found!" });

    // Check if exists any friendship between them
    const friendshipExist = await Friendships.findOne({
      where: {
        user_source_id: userExist.id,
        user_target_id: friendExist.id,
        [Op.or]: [
          {status: friendshipStatus.SENT},
          {status: friendshipStatus.ACCEPTED}
        ]
      },
      attributes: ["id", "status"]
    })

    if(friendshipExist) {
      // if user sent a request before and waiting for response
      if(friendshipExist.status === friendshipStatus.SENT)
        return res.badRequest({ message: "You have already sent a friendship request."});
      else
        return res.badRequest({ message: "The user is already your friend"});
    }

    // create friendship's row in database
    let newFriendship = new Friendships();
    newFriendship.user_source_id = userExist.id;
    newFriendship.user_target_id = friendExist.id;
    newFriendship.status = friendshipStatus.SENT;
    await newFriendship.save();

    res.done({ message: "Your request have successfully sent!" });

}

export const userAcceptFriend: RequestHandler = async (req: Request, res: Response) => {
  if(!req.userId) res.unauthorized({ message: "User identification is required!" });

  const { friend_id } = req.params;

  if(!friend_id) res.unauthorized({ message: "Friend identification is required!" });

  if(req.userId === friend_id) res.badRequest({ message: "You cannot send friendship request to yourself!" });

  // check if user exist
  const userExist = await Users.findOne({
    where: { user_identification: req.userId },
    attributes: ["id"]
  });
        
  if(!userExist) return res.notFound({ message: "User not found!" });

  // check if friend exist
  const friendExist = await Users.findOne({
    where: { user_identification: friend_id },
    attributes: ["id"]
  });
            
  if(!friendExist) return res.notFound({ message: "User not found!" });

  // Check if exists any friendship between them
  const friendshipExist = await Friendships.findOne({
    where: {
      user_source_id: friendExist.id,
      user_target_id: userExist.id,
      status: friendshipStatus.SENT
    },
    attributes: ["id", "status"]
  })

  if(!friendshipExist) return res.notFound({ message: "Not Found the request!"});

  // create friendship's row in database
  friendshipExist.status = friendshipStatus.ACCEPTED;
  await friendshipExist.save();

  res.done({ message: "The request is successfully accepted!" });
}

export const userRejectFriend: RequestHandler = async (req: Request, res: Response) => {
  if(!req.userId) res.unauthorized({ message: "User identification is required!" });

  const { friend_id } = req.params;

  if(!friend_id) res.unauthorized({ message: "Friend identification is required!" });

  if(req.userId === friend_id) res.badRequest({ message: "You cannot send friendship request to yourself!" });

  // check if user exist
  const userExist = await Users.findOne({
    where: { user_identification: req.userId },
    attributes: ["id"]
  });
        
  if(!userExist) return res.notFound({ message: "User not found!" });

  // check if friend exist
  const friendExist = await Users.findOne({
    where: { user_identification: friend_id },
    attributes: ["id"]
  });
            
  if(!friendExist) return res.notFound({ message: "User not found!" });

  // Check if exists any friendship between them
  const friendshipExist = await Friendships.findOne({
    where: {
      user_source_id: friendExist.id,
      user_target_id: userExist.id,
      status: friendshipStatus.SENT
    },
    attributes: ["id", "status"]
  })

  if(!friendshipExist) return res.notFound({ message: "Not Found the request!"});

  // create friendship's row in database
  friendshipExist.status = friendshipStatus.REJECTED;
  await friendshipExist.save();

  res.done({ message: "The request is successfully rejected!" });
}

export const userRequests: RequestHandler = async (req: Request, res: Response) => {
  if(!req.userId) res.unauthorized({ message: "User identification is required!" });

  // check if user exist
  const userExist = await Users.findOne({
    where: { user_identification: req.userId },
    attributes: ["id"]
  });
            
  if(!userExist) return res.notFound({ message: "User not found!" });

  const userRequests = await Friendships.findAll({
    attributes: ["status", "creation_date_time"],
    where: {
      user_target_id: userExist.id,
      status: friendshipStatus.SENT
    },
    include: [
      {
        model: Users,
        as: "sourceUser",
        attributes: ["user_identification", "user_email", "user_first_name", "user_last_name", "user_age"]
      }
    ]
  });

  if(userRequests.length === 0) res.ok({ message: "You do not have any friendship requests!" });

  res.done({ data: userRequests });
}