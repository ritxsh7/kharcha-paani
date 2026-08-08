import db from "../config/database.js";

class Friends {
  /*Friends service class */

  createUnregisteredFriend = async (userId, friendId) => {
    // CREATE UNREGISTERED FRIEND
    const CREATE_UNREGISTERED_FRIEND =
      "INSERT INTO friends(user_id, friend_id) VALUES ($1, $2) RETURNING *";

    const { result, error } = await db.query(CREATE_UNREGISTERED_FRIEND, [
      userId,
      friendId,
    ]);

    if (result) return result.rows[0];
    throw error;
  };

  getAllFriends = async (userId) => {
    const GET_ALL_FRIENDS = "SELECT * FROM user_friends WHERE user_id = $1";
    const GET_LENDINGS =
      "SELECT SUM(net_balance) FROM user_friends WHERE user_id = $1 AND net_balance < 0";

    const GET_BORROWINGS =
      "SELECT SUM(net_balance) FROM user_friends WHERE user_id = $1 AND net_balance > 0";

    const getFriends = db.query(GET_ALL_FRIENDS, [userId]);
    const getLendings = db.query(GET_LENDINGS, [userId]);
    const getBorrowings = db.query(GET_BORROWINGS, [userId]);

    const result = await Promise.all([getFriends, getLendings, getBorrowings]);

    if (result)
      return {
        friends: result[0].result.rows,
        lendings: result[1].result.rows[0].sum,
        borrowings: result[2].result.rows[0].sum,
      };
    throw error;
  };

  getFriendsLike = async (userId, name) => {
    const GET_FRIENDS_LIKE =
      "SELECT * FROM user_friends WHERE user_id = $1 AND LOWER(friend_name) like LOWER($2)";

    const searchName = `%${name}%`;

    const { result, error } = await db.query(GET_FRIENDS_LIKE, [
      userId,
      searchName,
    ]);

    if (result) return result.rows;
    throw error;
  };

  getUsersLike = async (phone) => {
    const GET_FRIENDS_LIKE =
      "SELECT user_id, username, phone, profile_color FROM users WHERE phone LIKE $1";

    const { result, error } = await db.query(GET_FRIENDS_LIKE, [`%${phone}%`]);

    if (result) return result.rows;
    throw error;
  };

  addFriend = async (userId, friendId) => {
    const ADD_FRIEND =
      "INSERT INTO friends VALUES ($1, $2), ($2, $1) RETURNING *";
    const { result, error } = await db.query(ADD_FRIEND, [userId, friendId]);

    if (result) return result.rows;
    throw error;
  };

  getContributions = async (userId, friendId, start, end) => {
    const GET_FRIEND_CONTRIBUTIONS = `
      SELECT 
        spending_user, 
        contri_id,
        contri_user,
        spending_date,
        settled, contri_username, contri_amount, description
        FROM user_contributions
        WHERE spending_user = $1 AND contri_user = $2 AND spending_date BETWEEN $3 AND $4
        ORDER BY spending_date DESC, contri_id DESC`;

    const GET_USER_CONTRIBUTIONS = `
        SELECT 
        spending_user,
        contri_id,
        contri_user,
        spending_date,
        settled, contri_username, contri_amount, description
        FROM user_contributions 
        WHERE spending_user = $2 AND contri_user = $1 AND spending_date BETWEEN $3 AND $4
        ORDER BY spending_date DESC, contri_id DESC`;

    const friendContributions = await db.query(GET_FRIEND_CONTRIBUTIONS, [
      userId,
      friendId,
      new Date(start),
      new Date(end),
    ]);

    const userContributions = await db.query(GET_USER_CONTRIBUTIONS, [
      userId,
      friendId,
      new Date(start),
      new Date(end),
    ]);

    // console.log(friendContributions, userContributions);

    if (friendContributions.error || userContributions.error) {
      throw friendContributions.error || userContributions.error;
    }
    return {
      friendContributions: friendContributions.result.rows,
      userContributions: userContributions.result.rows,
    };
  };

  settleBalance = async (userId, friendId) => {
    const CLEAR_BALANCE =
      "UPDATE friends SET balance = 0 WHERE user_id = $1 AND friend_id = $2";

    const CLEAR_ALL_TRANSACTIONS =
      "UPDATE contributions SET settled = true WHERE spending_user = $1 and user_id = $2";

    const [clearBalance, clearAllTransactions] = await Promise.all([
      db.query(CLEAR_BALANCE, [userId, friendId]),
      db.query(CLEAR_ALL_TRANSACTIONS, [userId, friendId]),
    ]);

    if (clearBalance.error || clearAllTransactions.error) {
      throw clearBalance.error || clearAllTransactions.error;
    }
    return {
      balanceCleared: clearBalance.result.rows,
      transactionsCleared: clearAllTransactions.result.rows,
    };
  };

  settleTransactions = async (userId, friendId, contri_id, amount) => {
    // console.log({ userId, friendId, contri_id, amount });

    const SETTLE_TRANSACTIONS =
      "UPDATE contributions SET settled = true WHERE contri_id = $1";
    const UPDATE_BALANCE =
      "UPDATE friends SET balance = balance - $3 WHERE user_id = $1 AND friend_id = $2 RETURNING balance";

    const [settleTransactions, updateBalance] = await Promise.all([
      db.query(SETTLE_TRANSACTIONS, [contri_id]),
      db.query(UPDATE_BALANCE, [userId, friendId, amount]),
    ]);

    // console.log(settleTransactions, updateBalance);

    if (settleTransactions?.error || updateBalance?.error) {
      throw settleTransactions?.error || updateBalance?.error;
    }
    return {
      settleTransactions: settleTransactions?.result.rows,
      updateBalance: updateBalance?.result.rows,
    };
  };

  acceptFriendRequest = async (userId, friendId) => {
    const ACCEPT_REQ = `
      INSERT INTO friends VALUES ($1, $2), ($2, $1)
    `;

    const { result, error } = await db.query(ACCEPT_REQ, [userId, friendId]);
    if (result) return result.rows;
    throw error;
  };
}

export default new Friends();
