import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ErrorAlert from "../common/ErrorAlert";
import Spinner from "../common/Spinner";

const ResponsiveDataTable = ({ data, columns, getLink, getRowKey }) => (
  <div className="hidden sm:block overflow-x-auto">
    <table className="w-full max-w-full table-auto text-sm">
      <thead>
        <tr className="bg-blue-50 text-xs sm:text-sm">
          {columns.map((col) => (
            <th
              key={col.header}
              className={`p-3 sm:p-4 whitespace-nowrap text-left ${col.headerClassName || ""
                }`}
            >
              {col.header}
            </th>
          ))}
          <th className="p-3 sm:p-4 text-right whitespace-nowrap">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={getRowKey(item, index)}
            className={index < data.length - 1 ? "border-b" : ""}
          >
            {columns.map((col) => (
              <td
                key={col.header}
                className={`p-3 sm:p-4 text-gray-600 ${col.cellClassName || ""
                  }`}
              >
                {col.cell ? col.cell(item) : item[col.accessor]}
              </td>
            ))}
            <td className="p-3 sm:p-4 text-right whitespace-nowrap">
              <Link
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border rounded-full shadow-sm text-blue-600 text-xs sm:text-sm"
                to={getLink(item)}
              >
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

ResponsiveDataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      cell: PropTypes.func,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
    })
  ).isRequired,
  getLink: PropTypes.func.isRequired,
  getRowKey: PropTypes.func.isRequired,
};

const ResponsiveDataCard = ({ data, renderCard, getRowKey }) => (
  <div className="sm:hidden space-y-4">
    {data.map((item, index) => (
      <div key={getRowKey(item, index)}>{renderCard(item)}</div>
    ))}
  </div>
);

ResponsiveDataCard.propTypes = {
  data: PropTypes.array.isRequired,
  renderCard: PropTypes.func.isRequired,
  getRowKey: PropTypes.func.isRequired,
};

const ResponsiveDataSection = ({
  title,
  data,
  columns,
  renderCard,
  getLink,
  isLoading,
  error,
  viewAllLink,
  emptyMessage = "No items found.",
  getRowKey = (item, index) => item?.id ?? index,
}) => {
  const hasData = data && data.length > 0;

  return (
    <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        {viewAllLink && (
          <Link className="text-sm text-blue-600" to={viewAllLink}>
            View All
          </Link>
        )}
      </div>

      {error && <ErrorAlert error={error} />}

      {isLoading ? (
        <Spinner />
      ) : !hasData ? (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <>
          <ResponsiveDataCard
            data={data}
            renderCard={renderCard}
            getRowKey={getRowKey}
          />
          <ResponsiveDataTable
            data={data}
            columns={columns}
            getLink={getLink}
            getRowKey={getRowKey}
          />
        </>
      )}
    </section>
  );
};

ResponsiveDataSection.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderCard: PropTypes.func.isRequired,
  getLink: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  viewAllLink: PropTypes.string,
  emptyMessage: PropTypes.string,
  getRowKey: PropTypes.func,
};

export default ResponsiveDataSection;