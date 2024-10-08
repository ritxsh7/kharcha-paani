import response from "../../helpers/response.js";
import contributions from "../../services/contributions.js";
import expenses from "../../services/expenses.js";
import groups from "../../services/groups.js";
import notifications from "../../services/notifications.js";
import spendings from "../../services/spendings.js";

export const getAllSpendings = async (req, res) => {
  try {
    const { start, end, page } = req.query;
    const spendingList = spendings.getAllSpendings(req.user.userId, start, end);
    const expenseList = spendings.getAllExpenses(req.user.userId, start, end);

    const resultList = await Promise.all([spendingList, expenseList]);
    return response.ok(res, resultList, "Fetched all spendings");
  } catch (error) {
    console.log(error);
    return response.serverError(res);
  }
};

export const createNewSpending = async (req, res) => {
  const { amount, description, contributors, date, groupSpending } = req.body;

  // console.log({ amount, description, contributors, date, groupSpending });

  // return response.ok(res);

  try {
    // NO CONTRIBUTORS => ADD AS PERSONAL EXPENSE
    if (contributors.length == 0) {
      const newExpense = await expenses.createNewExpense(
        req.user.userId,
        amount,
        description,
        date
      );
      return response.ok(res, newExpense);
    }

    // CREATE A SPENDING
    const newSpending = await spendings.createNewSpending(
      req.user.userId,
      amount,
      description,
      date
    );

    // CREATE ALL CONTRIBUTORS
    const newContributions =
      contributors.registered?.length > 0 &&
      (await contributions.createManyContributions(
        newSpending.spending_id,
        req.user.userId,
        contributors.registered
      ));

    const newGroupSpending =
      groupSpending &&
      (await groups.createGroupExpense(
        newSpending.spending_id,
        groupSpending.group_id
      ));

    const contributorsId = contributors.registered.map((c) => c.friend_id);

    if (contributors.registered.length > 0) {
      const notifyContributors = groupSpending
        ? await notifications.notifySpendings(
            req.user.userId,
            {
              groupId: groupSpending.group_id,
              groupName: groupSpending.group_name,
              groupAvatar: groupSpending.profile_color,
              senderName: req.user.username,
            },
            `${groupSpending.group_name}: ${req.user.username} added an expense for ${newSpending.description}-₹${newSpending.amount}`,
            "GROUP_SPENDING",
            contributorsId
          )
        : await notifications.notifySpendings(
            req.user.userId,
            {
              senderName: req.user.username,
              senderAvatar: req.user.profile,
            },
            `${req.user.username} added your contri for ${newSpending.description}-₹${newSpending.amount}`,
            "MUTUAL_SPENDING",
            contributorsId
          );
    }

    // CREATE ALL UNREGISTERED CONTRIBUTORS
    const newUnregisteredContributors =
      contributors.unregistered?.length > 0 &&
      (await contributions.createUnregisteredContribution(
        contributors.unregistered,
        newSpending.spending_id,
        req.user.userId
      ));

    //IF USER IS PRESENT THEN ADD PERSONAL EXPENSE
    const userExpense =
      contributors.user?.amount > 0 &&
      (await expenses.createNewExpense(
        req.user.userId,
        contributors.user.amount,
        description,
        date
      ));

    const result = await Promise.all([
      newContributions,
      newUnregisteredContributors,
    ]);

    return response.ok(res, {
      newSpending,
      newGroupSpending,
      newContributions: result[0],
      newUnregisteredContributors: result[1],
      userExpense,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(res);
  }
};

export const getAllContributors = async (req, res) => {
  const { id } = req.params;

  try {
    const contributors = await spendings.getAllContributors(id);
    return response.ok(res, contributors);
  } catch (error) {
    console.log(error);
    return response.serverError(res);
  }
};

export const getTotalAmount = async (req, res) => {
  try {
    const total = await spendings.getTotalAmount(req.user.userId);
    return response.ok(res, total);
  } catch (error) {
    console.log(error);
    return response.serverError(res);
  }
};
