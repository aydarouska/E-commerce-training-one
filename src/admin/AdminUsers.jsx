import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as usersApi from "../api/users";
import { getErrorMessage } from "../api/errors";
import { toastError, toastSuccess, confirmDialog } from "../utils/toast";
import useI18n from "../hooks/useI18n";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

// صفحه اداره المستخدمين: تغيير الصلاحيه (مستخدم/ادمن) و الحذف
export default function AdminUsers() {
  const { t, date } = useI18n();
  // الادمن الحالى (مايقدرش يغير صلاحيته او يمسح نفسه)
  const me = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState(null);

  // جلب المستخدمين
  useEffect(() => {
    usersApi
      .getUsers()
      .then((res) => setUsers(res.data.data.users))
      .catch((err) => toastError(getErrorMessage(err)));
  }, []);

  // تغيير صلاحيه مستخدم
  const changeRole = async (u, role) => {
    try {
      const res = await usersApi.updateUserRole(u.id, role);
      setUsers((list) => list.map((x) => (x.id === u.id ? res.data.data.user : x)));
      toastSuccess(t("admin.saved"));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  // حذف مستخدم بعد التأكيد
  const remove = async (u) => {
    const ok = await confirmDialog({
      title: t("admin.deleteUserConfirm", { name: u.name }),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      danger: true,
    });
    if (!ok) return;
    try {
      await usersApi.deleteUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      toastSuccess(t("admin.deleted"));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  if (!users) return <Spinner />;

  return (
    <>
      <h1 className="h4 fw-bold mb-3">{t("admin.users")} ({users.length})</h1>
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>{t("auth.name")}</th>
                <th>{t("auth.email")}</th>
                <th>{t("admin.joined")}</th>
                <th>{t("admin.role")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === me?.id;
                return (
                  <tr key={u.id}>
                    <td>{u.name} {isMe && <span className="badge bg-light text-dark border">{t("admin.you")}</span>}</td>
                    <td className="ltr-text">{u.email}</td>
                    <td className="small">{u.createdAt ? date(u.createdAt) : "-"}</td>
                    <td>
                      <select className="form-select form-select-sm tw:w-auto" value={u.role} disabled={isMe} onChange={(e) => changeRole(u, e.target.value)}>
                        <option value="user">{t("role.user")}</option>
                        <option value="admin">{t("role.admin")}</option>
                      </select>
                    </td>
                    <td className="text-end">
                      {!isMe && (
                        <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => remove(u)} aria-label={t("common.delete")}>
                          <Icon name="trash" size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
