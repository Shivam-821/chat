import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { GroupModel } from "../models/group.model";
import { GroupJoinRequestModel } from "../models/groupJoinRequest.model";
import { NotificationModel } from "../models/notification.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const getAdminGroups = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const groups = await GroupModel.find({ admin: user._id })
      .populate("members", "username email avatar")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { groups }, "Admin groups fetched successfully"),
      );
  },
);

export const createGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { name, members = [] } = req.body;
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return res.status(400).json(new ApiError(400, "Group name is required"));
    }

    // Case-insensitive uniqueness check — 'Hello' and 'hello' are the same group
    const existingGroup = await GroupModel.findOne({
      name: new RegExp(`^${trimmedName}$`, "i"),
    });
    if (existingGroup) {
      return res
        .status(400)
        .json(new ApiError(400, "A group with this name already exists"));
    }

    // Ensure the admin is part of the members array to easily fetch later
    const allMembers = Array.from(new Set([...members, user._id.toString()]));

    const newGroup = await GroupModel.create({
      name: trimmedName,
      admin: user._id,
      members: allMembers,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { group: newGroup }, "Group created successfully"),
      );
  },
);

export const getGroupById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;

    const group = await GroupModel.findById(id).populate(
      "members",
      "name username avatar",
    );

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    // Verify member access
    const isMember = group.members.some(
      (member: any) => member._id.toString() === user._id.toString(),
    );

    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { group }, "Group fetched successfully"));
  },
);

export const getGroupByName = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { name } = req.params;

    const group = await GroupModel.findOne({
      name: new RegExp(`^${name}$`, "i"),
    }).populate("members", "name username avatar");

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    // Verify member access
    const isMember = group.members.some(
      (member: any) => member._id.toString() === user._id.toString(),
    );

    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { group }, "Group fetched successfully"));
  },
);

export const getMyGroups = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const groups = await GroupModel.find({ members: user._id })
      .populate("members", "username email avatar")
      .sort({ updatedAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, { groups }, "Groups fetched successfully"));
  },
);

export const leaveGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;

    const group = await GroupModel.findById(id);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (group.admin.toString() === user._id.toString()) {
      throw new ApiError(
        400,
        "Admin cannot leave the group. You must delete the group or transfer ownership.",
      );
    }

    const isMember = group.members.some(
      (m: any) => m.toString() === user._id.toString(),
    );

    if (!isMember) {
      throw new ApiError(400, "You are not a member of this group");
    }

    group.members = group.members.filter(
      (m: any) => m.toString() !== user._id.toString(),
    ) as any;

    await group.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully left the group"));
  },
);

export const deleteGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;

    const group = await GroupModel.findById(id);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (group.admin.toString() !== user._id.toString()) {
      throw new ApiError(403, "Only the group admin can delete the group");
    }

    await GroupModel.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Group successfully deleted"));
  },
);

export const searchGroups = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const searchQuery = req.query.q as string;
    if (!searchQuery) {
      return res
        .status(200)
        .json(new ApiResponse(200, { groups: [] }, "No query provided"));
    }

    // Find groups that match the search term (case-insensitive)
    // Exclude groups where the current user is already a member
    const regex = new RegExp(searchQuery, "i");
    const groups = await GroupModel.find({
      name: { $regex: regex },
      members: { $ne: user._id },
    })
      .limit(10)
      .select("name members"); // We just need name and members count

    return res
      .status(200)
      .json(new ApiResponse(200, { groups }, "Groups parsed successfully"));
  },
);

export const addMembers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const { memberIds } = req.body as { memberIds: string[] };

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      throw new ApiError(400, "memberIds array is required");
    }

    const group = await GroupModel.findById(id);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (group.admin.toString() !== user._id.toString()) {
      throw new ApiError(403, "Only the group admin can add members");
    }

    // Filter out IDs already in the group
    const existingMemberIds = group.members.map((m: any) => m.toString());
    const newMemberIds = memberIds.filter(
      (id) => !existingMemberIds.includes(id),
    );

    if (newMemberIds.length === 0) {
      throw new ApiError(400, "All selected users are already members");
    }

    group.members = [...group.members, ...newMemberIds] as any;
    await group.save();

    const updatedGroup = await GroupModel.findById(id).populate(
      "members",
      "name username avatar",
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { group: updatedGroup },
          "Members added successfully",
        ),
      );
  },
);

// ── Group Join Requests ───────────────────────────────────────────────────────

export const requestJoinGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = req.params; // group ID

    const group = await GroupModel.findById(id);
    if (!group) throw new ApiError(404, "Group not found");

    // Can't request to join a group you're already in
    const isMember = group.members.some(
      (m: any) => m.toString() === user._id.toString(),
    );
    if (isMember)
      throw new ApiError(400, "You are already a member of this group");

    // Prevent duplicate requests
    const existing = await GroupJoinRequestModel.findOne({
      sender: user._id,
      group: id,
    });
    if (existing) throw new ApiError(400, "Join request already sent");

    const joinRequest = await GroupJoinRequestModel.create({
      sender: user._id,
      group: id,
      status: "pending",
    });

    // Notify the group admin
    await NotificationModel.create({
      user: group.admin,
      title: "Group Join Request",
      content: `${user.username} wants to join your group "${group.name}"`,
      notificationType: "request",
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { joinRequest }, "Join request sent successfully"),
      );
  },
);

export const getGroupJoinRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized");

    // Find all pending join requests for groups where the logged-in user is admin
    const adminGroups = await GroupModel.find({ admin: user._id }).select(
      "_id",
    );
    const groupIds = adminGroups.map((g) => g._id);

    const requests = await GroupJoinRequestModel.find({
      group: { $in: groupIds },
      status: "pending",
    })
      .populate("sender", "name username email")
      .populate("group", "name")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, { requests }, "Group join requests fetched"));
  },
);

export const updateGroupJoinRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized");

    const { requestId } = req.params;
    const { status } = req.body as { status: "accepted" | "rejected" };

    if (!["accepted", "rejected"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }

    const joinRequest =
      await GroupJoinRequestModel.findById(requestId).populate("group");
    if (!joinRequest) throw new ApiError(404, "Request not found");

    const group = joinRequest.group as any;

    // Only admin can respond
    if (group.admin.toString() !== user._id.toString()) {
      throw new ApiError(403, "Only the group admin can respond to requests");
    }

    joinRequest.status = status;
    await joinRequest.save();

    if (status === "accepted") {
      // Add sender to the group
      const alreadyMember = group.members.some(
        (m: any) => m.toString() === joinRequest.sender.toString(),
      );
      if (!alreadyMember) {
        group.members.push(joinRequest.sender);
        await group.save();
      }
    }

    // Notify the requester
    await NotificationModel.create({
      user: joinRequest.sender,
      title: "Group Join Request Update",
      content: `Your request to join "${group.name}" was ${status}`,
      notificationType: "request",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { joinRequest }, `Request ${status} successfully`),
      );
  },
);
