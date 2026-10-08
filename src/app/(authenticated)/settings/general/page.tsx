import AreaSetting from "./_components/area-setting";
import DefaultStageSetting from "./_components/default-stage-setting";
import RoleSetting from "./_components/role-setting";

export default function GeneralSettingsPage() {
  return (
    <section className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          Listas compartidas por todas las vacantes
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 ">
        <div className="flex flex-col gap-4">
          <AreaSetting /> <RoleSetting />
        </div>
        <div className="flex flex-col gap-4">
          <DefaultStageSetting />
        </div>
      </div>
    </section>
  );
}
