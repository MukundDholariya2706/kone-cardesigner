import React, { useContext, useEffect, useMemo, useState } from "react";
import { FEEDBACK_ACTION } from "../../constants";
import { APIContext } from "../../store/api/APIProvider";
import { DesignContext } from "../../store/design/DesignProvider";
import { ProductContext } from "../../store/product/ProductProvider";
import { SiteContext } from "../../store/site/SiteProvider";
import { ToastContext } from "../../store/toast/ToastProvider";
import { TranslationContext } from "../../store/translation/TranslationProvider";
import { UserContext } from "../../store/user/UserProvider";
import { AuthContext } from "../../store/auth/AuthProvider";
import {
  useInterval,
  useProjectCountry,
} from "../../utils/customHooks/customHooks";
import Button from "../Button";
import Dialog, {
  DialogBody,
  DialogFooter,
  DialogHead,
  DialogNotification,
} from "../Dialog";
import FormInput from "../FormInput";
import FormSelect from "../FormSelect";
import Icon from "../Icon";
import NumberRatingSelector from "../NumberRatingSelector/NumberRatingSelector";
import PrivacyStatement from "../PrivacyStatement/PrivacyStatement";
import { useRecaptcha } from "../Recaptcha";
import SmileySelector from "../SmileySelector/SmileySelector";
import Toast from "../Toast";
import "./FeedbackForms.scss";

const SUBJECT_OPTIONS = [
  {
    text: "ui-feedback-subject-suggestion",
    value: "suggestion",
  },
  {
    text: "ui-feedback-subject-compliment",
    value: "compliment",
  },
  {
    text: "ui-feedback-subject-bug",
    value: "bug",
  },
  {
    text: "ui-feedback-subject-question",
    value: "question",
  },
];

const FeedbackSources = {
  FullDialog: "full-dialog",
  CompactDialog: "compact-dialog",
  ErrorDialog: "error-dialog",
};

const AUTO_CLOSE_SECONDS = 3;

function isValidEmail(email = "", required) {
  if (!email) return !required;
  // This should be enough if we assume that the users don't input ridiculous values
  const parts = email.split("@");
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
export function FeedbackDialog(props) {
  const { className = "", onClose } = props;

  const {
    submit,
    email,
    setEmail,
    message,
    setMessage,
    numberRating,
    setNumberRating,
    subject,
    setSubject,
    smileySelection,
    setSmileySelection,
    canSubmit,
    successfullySubmitted,
  } = useFeedbackDialogAPI(
    {
      source: FeedbackSources.FullDialog,
    },
    { email: true, message: true, subject: true }
  );

  const [error, setError] = useState(null);

  const { getText } = useContext(TranslationContext);

  const subjectOptions = useMemo(() => {
    return SUBJECT_OPTIONS.map(({ text, value }) => ({
      text: getText(text),
      value,
    }));
  }, [getText]);

  async function handleSubmit() {
    try {
      setError(null);
      await submit();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <Dialog
      className={`FeedbackDialog ${
        smileySelection ? "smiley-selected" : "no-smiley-selected"
      }`}
      data-testid="FeedbackDialog"
    >
      <DialogNotification>
        {error && (
          <Toast
            message={getText("ui-unexpected-error")}
            type="error"
            autoDismiss={null}
          />
        )}
      </DialogNotification>
      <DialogHead onClose={(e) => onClose(e)}>
        {getText("ui-feedback-full-dialog-heading")}
      </DialogHead>
      <DialogBody>
        {!successfullySubmitted ? (
          <div className="form">
            <div className="form-section">
              <p className="input-label">
                {getText("ui-feedback-what-do-you-think")}
              </p>
              <SmileySelector
                selection={smileySelection}
                setSelection={setSmileySelection}
              />
            </div>
            <div className={`form-content`}>
              <FormSelect
                emptySelectionText={getText("ui-general-please-select")}
                label={getText("ui-feedback-subject-label")}
                className="form-section half-width"
                options={subjectOptions}
                onChange={(val) => setSubject(val)}
                value={subject}
              />
              <FormInput
                header={getText("ui-feedback-what-would-you-share")}
                placeholder={getText("ui-feedback-give-us-feedback")}
                value={message}
                onChange={(e) => setMessage(e.value)}
                textarea={true}
                className="form-section"
              />
              <FormInput
                header={getText("ui-feedback-email-label")}
                placeholder={getText("ui-feedback-email-placeholder")}
                error={getText("ui-contact-error-email")}
                identifier={"email"}
                value={email}
                onChange={(e) => {
                  setEmail(e.value);
                }}
                className="form-section half-width"
              />
              <div className="form-section">
                <p className="input-label">
                  {getText("ui-feedback-how-likely-to-recommend")}
                  <span className="required">*</span>
                </p>
                <NumberRatingSelector
                  selectedOption={numberRating}
                  setSelectedOption={setNumberRating}
                />
              </div>
              <PrivacyStatement />
            </div>
          </div>
        ) : (
          <SuccessView
            onClose={onClose}
            autoCloseSeconds={AUTO_CLOSE_SECONDS}
          />
        )}
      </DialogBody>
      {!successfullySubmitted && (
        <DialogFooter>
          <Button
            className="btn"
            inlineBlock={true}
            theme={["sm", "outline", "center", "uppercase"]}
            onClick={onClose}
          >
            {getText("ui-general-cancel")}
          </Button>
          <ActionButton
            className="btn action-button"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {getText("ui-general-submit")}
          </ActionButton>
        </DialogFooter>
      )}
    </Dialog>
  );
}

export function ReportIssueDialog(props) {
  const { className = "", onClose } = props;

  const {
    submit,
    email,
    setEmail,
    message,
    setMessage,
    canSubmit,
    successfullySubmitted,
  } = useFeedbackDialogAPI(
    {
      subject: "crash", // Need to provide some subject because it is required with a message
      source: FeedbackSources.ErrorDialog,
    },
    { numberRating: true, smileySelection: true, email: true }
  );

  const [error, setError] = useState(null);

  const { getText } = useContext(TranslationContext);

  async function handleSubmit() {
    try {
      setError(null);
      await submit();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <Dialog className={`ReportIssueDialog FeedbackDialog ${className}`}>
      <DialogNotification>
        {error && (
          <Toast
            message={getText("ui-unexpected-error")}
            type="error"
            autoDismiss={null}
          />
        )}
      </DialogNotification>
      <DialogHead onClose={(e) => onClose(e)}>
        {getText("ui-feedback-issue-dialog-heading")}
      </DialogHead>
      <DialogBody>
        {!successfullySubmitted ? (
          <div className="form">
            <FormInput
              header={getText("ui-feedback-what-would-you-share")}
              placeholder={getText("ui-feedback-what-can-we-do-better")}
              value={message}
              onChange={(e) => setMessage(e.value)}
              textarea={true}
              className="form-section"
            />
            <FormInput
              header={getText("ui-feedback-email-label")}
              placeholder={getText("ui-feedback-email-placeholder")}
              error={getText("ui-contact-error-email")}
              identifier={"email"}
              value={email}
              onChange={(e) => {
                setEmail(e.value);
              }}
              className="form-section half-width"
            />
            <PrivacyStatement />
          </div>
        ) : (
          <SuccessView
            onClose={onClose}
            autoCloseSeconds={AUTO_CLOSE_SECONDS}
          />
        )}
      </DialogBody>
      {!successfullySubmitted && (
        <DialogFooter>
          <Button
            className="btn"
            inlineBlock={true}
            theme={["sm", "outline", "center", "uppercase"]}
            onClick={onClose}
          >
            {getText("ui-general-cancel")}
          </Button>
          <ActionButton
            className="btn action-button"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {getText("ui-general-submit")}
          </ActionButton>
        </DialogFooter>
      )}
    </Dialog>
  );
}

function SuccessView(props) {
  const [seconds, setSeconds] = useState(props.autoCloseSeconds);

  useInterval(() => {
    if (seconds <= 0) return;
    setSeconds((prev) => prev - 1);
  }, 1000);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      props.onClose?.();
    }, (props.autoCloseSeconds + 1) * 1000); // "plus 1" so the zero is displayed in the UI for a second

    return () => {
      clearTimeout(timeoutId);
    };
  }, [props]);

  const { getText } = useContext(TranslationContext);
  return (
    <div className="SuccessView">
      <p className="heading">{getText("ui-feedback-success-thank-you")}</p>
      <Icon className="success-icon" id="icon-success" />
      <p className="closes-in-text">
        {getText("ui-feedback-success-close-in-seconds-1")} {seconds}{" "}
        {getText("ui-feedback-success-close-in-seconds-2")}
      </p>
    </div>
  );
}
export function CompactFeedbackForm(props) {
  const { className = "", onClose } = props;
  const { addToast } = useContext(ToastContext);

  const {
    submit,
    email,
    setEmail,
    message,
    setMessage,
    smileySelection,
    setSmileySelection,
    canSubmit,
    successfullySubmitted,
  } = useFeedbackDialogAPI(
    {
      source: FeedbackSources.CompactDialog,
      subject: "general-feedback",
    },
    { numberRating: true, message: true, email: true }
  );

  const { getText } = useContext(TranslationContext);

  async function handleSubmit() {
    try {
      await submit();
    } catch (err) {
      addToast({ message: getText("ui-unexpected-error"), type: "error" });
    }
  }

  return (
    <div className={`CompactFeedbackForm ${className}`}>
      <div className="close-button-container">
        <div className="close-icon" onClick={onClose}>
          <Icon id="icon-close" />
        </div>
      </div>
      {!successfullySubmitted ? (
        <>
          <h2 className="heading">
            {getText("ui-feedback-compact-dialog-heading")}
          </h2>
          <SmileySelector
            selection={smileySelection}
            setSelection={setSmileySelection}
          />
          <FormInput
            header={getText("ui-feedback-give-us-feedback")}
            placeholder={getText("ui-feedback-give-us-feedback")}
            value={message}
            onChange={(e) => setMessage(e.value)}
            textarea={true}
            className="form-section"
          />
          <FormInput
            header={getText("ui-feedback-email-label")}
            placeholder={getText("ui-feedback-email-placeholder")}
            error={getText("ui-contact-error-email")}
            identifier={"email"}
            value={email}
            onChange={(e) => {
              setEmail(e.value);
            }}
            className="form-section half-width"
          />
          <PrivacyStatement />
          <ActionButton
            className="action-button"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {getText("ui-general-submit")}
          </ActionButton>
        </>
      ) : (
        <SuccessView onClose={onClose} autoCloseSeconds={AUTO_CLOSE_SECONDS} />
      )}
    </div>
  );
}

function ActionButton(props) {
  const { className = "", children, ...rest } = props;
  return (
    <button className={`ActionButton ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function useFeedbackDialogAPI(options = {}, optionalFields = {}) {
  const { subject: subjectDefault = null, source = "" } = options;

  const api = useContext(APIContext);
  const executeRecaptcha = useRecaptcha(undefined, {
    handleBadgeVisibility: false,
  });
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [numberRating, setNumberRating] = useState(null);
  const [subject, setSubject] = useState(subjectDefault);
  const [smileySelection, setSmileySelection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState(false);
  const projectCountry = useProjectCountry();
  const userCtx = useContext(UserContext);
  const siteCtx = useContext(SiteContext);
  const productCtx = useContext(ProductContext);
  const designCtx = useContext(DesignContext);
  const { loggedInUser } = useContext(AuthContext);

  const validEmail = useMemo(
    () => isValidEmail(email.trim(), !optionalFields.email),
    [email, optionalFields]
  );

  // This is dumb as every field is "validated" when anything changes but no time to do a proper form handler
  // and the one that is in use in the contact form isn't any better so not using that one
  // TODO the app really could use a proper form handler like Formik or similar
  const validSmiley = optionalFields.smileySelection || !!smileySelection;
  const validNumber = optionalFields.numberRating || numberRating !== null; // Check null specifically because 0 is a valid value

  // With this it is possible to submit even in situations where a subject has been selected
  // but the message is empty. This might be undesirable but probably better than arbitrarily
  // disabling the submit button in this situation as it might be unclear to the user as to why submitting is disabled.
  // There shouldn't be any harm sending the feedback in this case anyway so not validating for that specific setup.
  const validMessage = optionalFields.message || !!message.trim();

  const validSubject = useMemo(() => {
    if (message.trim().length > 0) return !!subject; // required if there is some message
    return optionalFields.subject || !!subject;
  }, [message, optionalFields, subject]);

  const canSubmit = useMemo(() => {
    if (successfullySubmitted) return false;
    return (
      validEmail &&
      validSmiley &&
      validNumber &&
      validMessage &&
      validSubject &&
      !submitting
    );
  }, [
    validEmail,
    validSmiley,
    validNumber,
    validMessage,
    validSubject,
    submitting,
    successfullySubmitted,
  ]);

  async function submit() {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      await api.get("/check");
      const recaptchaResult = await executeRecaptcha(FEEDBACK_ACTION);
      const loggedInEmail = loggedInUser ? loggedInUser.mail : "";
      const dataToSend = {
        email: email.trim(),
        message: message.trim(),
        loggedInEmail,
        happiness: smileySelection,
        subject,
        wouldRecommend: numberRating,
        projectCountry: projectCountry?.name,
        role: userCtx.role,
        productId: productCtx.product?.id,
        releaseId: productCtx.product?.productRelease,
        currentUrl: window.location.href,
        designId: designCtx.hiddenId,
        source,
        build: siteCtx.carDesignerBuildNumber,
        ...recaptchaResult,
      };
      const result = await api.post("/contact/feedback", dataToSend, {
        withKeyToken: true,
      });
      setSuccessfullySubmitted(true);
      return result;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submit,
    email,
    setEmail,
    message,
    setMessage,
    numberRating,
    setNumberRating,
    subject,
    setSubject,
    smileySelection,
    setSmileySelection,
    canSubmit,
    successfullySubmitted,
  };
}
