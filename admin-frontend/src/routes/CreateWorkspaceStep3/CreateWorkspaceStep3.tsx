import { useCallback, useContext, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import FormErrorMessage from '../../components/FormErrorMessage/FormErrorMessage';
import OnboardingLayout from '../../components/OnboardingLayout/OnboardingLayout';
import SuccessAlert from '../../components/SuccessAlert/SuccessAlert';
import CreateWorkspaceContext from '../../contexts/create-workspace';
import { useAPI, useAPIErrorHandler } from '../../hooks/api';
import { useFieldRequiredErrorMessage } from '../../hooks/errors';
import * as schemas from '../../schemas';

const CreateWorkspaceStep3: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  const { t } = useTranslation('workspaces');
  const api = useAPI();
  const navigate = useNavigate();

  const [checkConnectionSuccess, setCheckConnectionSuccess] = useState(false);
  const [checkConnectionError, setCheckConnectionError] = useState<string | undefined>(undefined);

  const [createWorkspace, setCreateWorkspace] = useContext(CreateWorkspaceContext);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<schemas.workspace.WorkspaceCreate>({ defaultValues: createWorkspace });
  const fieldRequiredErrorMessage = useFieldRequiredErrorMessage();
  const handleAPIError = useAPIErrorHandler(setCheckConnectionError, setError);

  const onCheckConnection: SubmitHandler<schemas.workspace.WorkspaceCreate> = useCallback(async (data) => {
    setCheckConnectionSuccess(false);
    setCheckConnectionError(undefined);
    try {
      await api.checkConnectionWorkspace(data);
      setCheckConnectionSuccess(true);
    } catch (err) {
      handleAPIError(err);
    }
  }, [api, handleAPIError]);

  const onSubmit: SubmitHandler<schemas.workspace.WorkspaceCreate> = useCallback((data) => {
    setCreateWorkspace({
      ...createWorkspace,
      ...data,
    });
    navigate('/create-workspace/step4');
  }, [createWorkspace, setCreateWorkspace, navigate]);

  return (
    <OnboardingLayout active={3}>
      <h1 className="text-3xl text-slate-800 font-bold">{t('create.step3_title')}</h1>
      <div className="text-xs mb-6">{t('create.database_credentials_security_notice')}</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="database_type">{t('create.database_type')}</label>
            <select
              id="database_type"
              className="form-select w-full"
              {...register('database_type', { required: fieldRequiredErrorMessage })}
            >
              {Object.values(schemas.workspace.DatabaseType).map((type) =>
                <option key={type} value={type}>{t(`database_type.${type}`)}</option>
              )}
            </select>
            <FormErrorMessage errors={errors} name="database_type" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="database_host">{t('create.database_host')}</label>
              <input
                id="database_host"
                className="form-input w-full"
                type="text"
                {...register('database_host', { required: fieldRequiredErrorMessage })}
              />
              <FormErrorMessage errors={errors} name="database_host" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1" htmlFor="database_port">{t('create.database_port')}</label>
              <input
                id="database_port"
                className="form-input w-full"
                type="number"
                {...register('database_port', { required: fieldRequiredErrorMessage })}
              />
              <FormErrorMessage errors={errors} name="database_port" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="database_username">{t('create.database_username')}</label>
            <input
              id="database_username"
              className="form-input w-full"
              type="text"
              {...register('database_username', { required: fieldRequiredErrorMessage })}
            />
            <FormErrorMessage errors={errors} name="database_username" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="database_password">{t('create.database_password')}</label>
            <input
              id="database_password"
              className="form-input w-full"
              type="password"
              autoComplete="off"
              {...register('database_password', { required: fieldRequiredErrorMessage })}
            />
            <FormErrorMessage errors={errors} name="database_password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="database_name">{t('create.database_name')}</label>
            <input
              id="database_name"
              className="form-input w-full"
              type="text"
              {...register('database_name', { required: fieldRequiredErrorMessage })}
            />
            <FormErrorMessage errors={errors} name="database_name" />
          </div>
          {checkConnectionError && <ErrorAlert message={t('create.check_connection_error', { error: checkConnectionError })} />}
          {checkConnectionSuccess && <SuccessAlert message={t('create.check_connection_success')} />}
        </div>
        <div className="flex items-center justify-between">
          <Link className="text-sm underline hover:no-underline" to="../step2">&lt;- {t('create.back')}</Link>
          <div>
            <button type="button" className="text-sm underline hover:no-underline mr-2" onClick={handleSubmit(onCheckConnection)}>{t('create.check_connection')}</button>
            <button type="submit" className="btn bg-primary-500 hover:bg-primary-600 text-white ml-auto">{t('create.next')} -&gt;</button>
          </div>
        </div>
      </form>
    </OnboardingLayout>
  );
};

export default CreateWorkspaceStep3;
